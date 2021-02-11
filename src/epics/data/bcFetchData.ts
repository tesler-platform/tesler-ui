/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Observable } from 'rxjs'
import { Store, AnyAction } from 'redux'
import { Epic, types, $do, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { buildBcUrl } from '../../utils/strings'
import { fetchBcData, createCanceler } from '../../api/api'
import { cancelRequestActionTypes, cancelRequestEpic } from '../../utils/cancelRequestEpic'
import { ActionsObservable } from 'redux-observable'
import { DataItem, WidgetOptions, WidgetTypes } from '@tesler-ui/schema'
import { BcFilter, FilterType } from '../../interfaces/filters'
import { getFilters, getSorters } from '../../utils/filters'
import { PopupWidgetTypes, WidgetMeta } from '../../interfaces/widget'
import { getBcChildren } from '../../utils/bc'
import { BcMetaState } from '../../interfaces/bc'

const maxDepthLevel = 10

/**
 *
 *
 * Loads BC's data.
 * In case successful download:
 * - dispatches action to store
 * - initializes rowMeta load
 * - initializes child BCs data load
 *
 * @param action.payload.bcName BC's name for data load
 * @category Epics
 */
export const bcFetchDataEpic: Epic = (action$, store) =>
    action$
        .ofType(types.bcFetchDataRequest, types.bcFetchDataPages, types.showViewPopup, types.bcForceUpdate, types.bcChangePage)
        .mergeMap(action => {
            return Observable.race(...bcFetchDataImpl(action, store, action$))
        })

type ActionType = ActionsMap[
    | typeof types.bcFetchDataRequest
    | typeof types.bcFetchDataPages
    | typeof types.showViewPopup
    | typeof types.bcForceUpdate
    | typeof types.bcChangePage]

export function bcFetchDataImpl(
    action: ActionType,
    store: Store<CoreStore, AnyAction>,
    actionObservable: ActionsObservable<AnyAction>
): Array<Observable<AnyAction>> {
    const state = store.getState()
    const { widgetName } = action.payload
    const { widgets, infiniteWidgets } = state.view

    /**
     * TODO: Widget name will be mandatory in 2.0.0 but until then collision-vulnarable fallback is provided
     * through business component match
     */
    const widget = widgets.find(item => item.name === widgetName) ?? widgets.find(item => item.bcName === action.payload.bcName)
    const bcName = widget.bcName
    const { depth } = (action as ActionsMap[typeof types.bcFetchDataRequest]).payload
    const bc = state.screen.bo.bc[bcName]
    const { cursor, page } = bc
    const limit = widgets.find(i => i.bcName === bcName)?.limit || bc.limit
    const sorters = state.screen.sorters[bcName]
    /**
     * If popup has the same bc as initiator no data fetching required, it will be
     * handled by initiator widget instead
     */
    if (action.type === types.showViewPopup && bcName === action.payload.calleeBCName) {
        return [Observable.empty()]
    }

    const anyHierarchyWidget = widgets.find(item => {
        return item.bcName === bcName && item.type === WidgetTypes.AssocListPopup && isHierarchyWidget(item)
    })

    const sameBcHierarchyOptions = anyHierarchyWidget?.options?.hierarchySameBc && anyHierarchyWidget.options
    const depthLevel = sameBcHierarchyOptions && (depth || 1)
    const limitBySelfCursor = !depthLevel && state.router.bcPath?.includes(`${bcName}/${cursor}`)
    const bcUrl = buildBcUrl(bcName, limitBySelfCursor)

    // Hierarchy widgets has own filter implementation
    const fetchParams: Record<string, any> = {
        _page: page,
        _limit: limit,
        ...getFiltersParams(widget, state.screen.filters[bcName], cursor, bc, depthLevel, widgets, sameBcHierarchyOptions),
        ...getSorters(sorters)
    }

    if (action.type === types.bcForceUpdate) {
        const infinityPaginationWidget =
            (widgetName && infiniteWidgets.includes(widgetName)) ||
            widgets?.filter(item => item.bcName === bcName)?.find(item => infiniteWidgets.includes(item.name))?.name
        if (infinityPaginationWidget) {
            fetchParams._page = 1
            fetchParams._limit = limit * page
        }
    }

    if (action.type === types.bcFetchDataPages) {
        fetchParams._page = action.payload.from || 1
        fetchParams._limit = (action.payload.to || page - fetchParams._page) * limit
    }
    if ((action.type === types.bcFetchDataRequest && action.payload.ignorePageLimit) || anyHierarchyWidget?.options?.hierarchyFull) {
        fetchParams._limit = 0
    }
    const canceler = createCanceler()
    const cancelFlow = cancelRequestEpic(
        actionObservable,
        cancelRequestActionTypes,
        canceler.cancel,
        $do.bcFetchDataFail({ bcName, bcUrl, depth: depthLevel })
    )
    const cancelByParentBc = cancelRequestEpic(
        actionObservable,
        [types.bcSelectRecord],
        canceler.cancel,
        $do.bcFetchDataFail({ bcName, bcUrl, depth: depthLevel }),
        filteredAction => {
            const actionBc = filteredAction.payload.bcName
            return bc.parentName === actionBc
        }
    )

    const normalFlow = fetchBcData(state.screen.screenName, bcUrl, fetchParams, canceler.cancelToken)
        .mergeMap(response => {
            const cursorChange = getCursorChange(response.data, action, cursor, !!anyHierarchyWidget)
            const parentOfNotLazyWidget = widgets.some(item => {
                return state.screen.bo.bc[item.bcName]?.parentName === bcName
            })
            const lazyWidget = PopupWidgetTypes.includes(widget.type as typeof PopupWidgetTypes[0]) && !parentOfNotLazyWidget

            const infiniteLoopProtection = depthLevel > maxDepthLevel
            if (lazyWidget || !response.data?.length || (depthLevel && infiniteLoopProtection)) {
                return Observable.empty<never>()
            }
            const fetchChildren = getChildrenData(action, widgets, state.screen.bo.bc, depthLevel, !!anyHierarchyWidget)
            const fetchRowMeta =
                action.type === types.bcFetchDataRequest && action.payload.depth > 1
                    ? Observable.empty<never>()
                    : Observable.of<AnyAction>($do.bcFetchRowMeta({ widgetName, bcName }))

            return Observable.concat(
                cursorChange,
                Observable.of(
                    $do.bcFetchDataSuccess({
                        bcName,
                        data: response.data,
                        depth: action.type === types.bcFetchDataRequest ? action.payload.depth : null,
                        bcUrl,
                        hasNext: response.hasNext
                    })
                ),
                fetchRowMeta,
                fetchChildren
            )
        })
        .catch((error: any) => {
            console.error(error)
            return Observable.of($do.bcFetchDataFail({ bcName: action.payload.bcName, bcUrl, depth: depthLevel }))
        })
    return [cancelFlow, cancelByParentBc, normalFlow]
}

/**
 *
 * @param data Response data for business component
 * @param action Action that initiated data fetch
 * @param prevCursor Previous cursor for affected business component
 * @param isHierarchy Fetch performed for the hierarchy widget
 */
function getCursorChange(data: DataItem[], action: ActionType, prevCursor: string, isHierarchy: boolean) {
    const { bcName } = action.payload
    const { keepDelta, depth } = (action as ActionsMap[typeof types.bcFetchDataRequest]).payload
    const newCursor = data[0]?.id
    const changeCurrentCursor = Observable.of<AnyAction>(
        $do.bcChangeCursors({
            cursorsMap: {
                [bcName]: data.some(i => i.id === prevCursor) ? prevCursor : newCursor
            },
            keepDelta: isHierarchy || keepDelta
        })
    )
    const changeCursors =
        action.type === types.bcFetchDataRequest && depth
            ? Observable.of<AnyAction>($do.bcChangeDepthCursor({ bcName, cursor: newCursor, depth }))
            : changeCurrentCursor
    return changeCursors
}

/**
 *
 * @param action
 * @param widgets
 * @param bcDictionary
 * @param depthLevel
 * @param isHierarchy
 */
function getChildrenData(
    action: ActionType,
    widgets: WidgetMeta[],
    bcDictionary: Record<string, BcMetaState>,
    depthLevel: number,
    isHierarchy: boolean
) {
    const { bcName } = action.payload
    const { ignorePageLimit } = (action as ActionsMap[typeof types.bcFetchDataRequest]).payload
    const { keepDelta } = (action as ActionsMap[typeof types.bcFetchDataRequest]).payload

    /**
     * Apparently only used for hierarchies builded around the same business component
     *
     * Simply repeats data fetch for incremented depth
     * `ignorePageLimit` is set due to lack of pagination controls for nested nodes
     */
    if (depthLevel) {
        // TODO: Should check `hierarchySameBc` widget option instead
        return Observable.of(
            $do.bcFetchDataRequest({
                bcName,
                depth: depthLevel + 1,
                widgetName: '', // TODO: Should not be empty
                ignorePageLimit: true
            })
        )
    }

    return Observable.concat(
        ...Object.entries(getBcChildren(bcName, widgets, bcDictionary)).map(entry => {
            const [childBcName, widgetNames] = entry
            const childWidgetLazy =
                widgets.some(
                    item => widgetNames.includes(item.name) && PopupWidgetTypes.includes(item.type as typeof PopupWidgetTypes[0])
                ) &&
                !widgets.some(item => {
                    return bcDictionary[item.bcName]?.parentName === childBcName
                })
            if (childWidgetLazy) {
                return Observable.empty<never>()
            }
            return Observable.of(
                $do.bcFetchDataRequest({
                    bcName: childBcName,
                    widgetName: widgetNames[0],
                    ignorePageLimit: ignorePageLimit || action.type === types.showViewPopup,
                    keepDelta: isHierarchy || keepDelta
                })
            )
        })
    )
}

/**
 * Builds filter parameters
 *
 * Full hierarchies are filtered locally
 *
 * @param item
 * @param filters
 * @param cursor
 * @param bc
 * @param depthLevel
 * @param widgets @deprecated TODO: Remove in favor of `item`
 * @param sameBcHierarchyOptions @deprecated TODO: Deductable from `item`
 * @returns Dictionary of GET query parameters
 */
function getFiltersParams(
    widget: WidgetMeta,
    filters: BcFilter[],
    cursor: string,
    bc: BcMetaState,
    depthLevel: number,
    widgets: WidgetMeta[],
    sameBcHierarchyOptions: WidgetOptions
): Record<string, string> {
    const result = filters ? [...filters] : []
    const fullHierarchyWidget = widgets.find(item => {
        return item.bcName === bc.name && item.type === WidgetTypes.AssocListPopup && item.options?.hierarchyFull
    })
    // Full hierarchies are filtered locally
    if (fullHierarchyWidget) {
        return {}
    }
    if (depthLevel) {
        result.push({
            type: depthLevel === 1 ? FilterType.specified : FilterType.equals,
            fieldName: sameBcHierarchyOptions.hierarchyParentKey || 'parentId',
            value: depthLevel === 1 ? false : depthLevel === 2 ? cursor : bc.depthBc[depthLevel - 1].cursor
        })
    }
    return getFilters(result)
}

/**
 * Determines if the argument is hierarchy widget
 *
 * TODO: Should be typeguard when hierarchy widgets will have actual distinct interfaces
 *
 * @param widget Widget to check
 * @returns `true` if widget option `hierarchy`, `hierarchySameBc` or `hierarchyFull` is set; `else` otherwise
 */
function isHierarchyWidget(widget: WidgetMeta) {
    return widget.options?.hierarchy || widget.options?.hierarchySameBc || widget.options?.hierarchyFull
}
