/**
 * For epics which work with records
 */
import { $do, AnyAction, Epic, types } from '../actions/actions'
import { Observable } from 'rxjs/Observable'
import { OperationTypeCrud, AssociatedItem } from '../interfaces/operation'
import { DataItem, MultivalueSingleValue } from '../interfaces/data'
import { WidgetTableHierarchy, WidgetTableMeta } from '../interfaces/widget'
import * as api from '../api/api'
import { buildBcUrl } from '../utils/strings'
import { getFilters, getSorters } from '../utils/filters'
import { matchOperationRole } from '../utils/operations'
import { PendingValidationFailsFormat } from '../interfaces/view'
import { removeMultivalueTag } from './data/removeMultivalueTag'
import { cancelRequestActionTypes, cancelRequestEpic } from '../utils/cancelRequestEpic'
import { bcCancelCreateDataEpic } from './data/bcCancelCreateDataEpic'
import { bcNewDataEpic } from './data/bcNewDataEpic'
import { bcFetchRowMetaRequest } from './data/bcFetchRowMetaRequest'
import { selectView } from './data/selectView'
import { getBcChildren } from '../utils/bc'
import { bcSelectDepthRecord } from './data/bcSelectDepthRecord'
import { bcFetchDataEpic } from './data/bcFetchData'
import { bcSaveDataEpic } from './data/bcSaveData'
import { saveAssociationsActive } from './data/saveAssociationsActive'

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const bcLoadMore: Epic = (action$, store) =>
    action$.ofType(types.bcLoadMore).mergeMap(action => {
        const state = store.getState()
        const bcName = action.payload.bcName
        const bc = state.screen.bo.bc[bcName]
        const { cursor, page } = bc
        const limit = state.view.widgets.find(i => i.bcName === bcName)?.limit || bc.limit
        const limitBySelfCursor = state.router.bcPath?.includes(`${bcName}/${cursor}`)
        const bcUrl = buildBcUrl(bcName, limitBySelfCursor)
        const filters = state.screen.filters[bcName] || []
        const sorters = state.screen.sorters[bcName]

        const fetchParams: Record<string, any> = {
            _page: page,
            _limit: limit,
            ...getFilters(filters),
            ...getSorters(sorters)
        }

        const canceler = api.createCanceler()
        const cancelFlow = cancelRequestEpic(action$, cancelRequestActionTypes, canceler.cancel, $do.bcFetchDataFail({ bcName, bcUrl }))
        const normalFlow = api
            .fetchBcData(state.screen.screenName, bcUrl, fetchParams, canceler.cancelToken)
            .mergeMap(data => {
                const oldBcDataIds = state.data[bcName]?.map(i => i.id)
                const newData = [...state.data[bcName], ...data.data.filter((i: DataItem) => !oldBcDataIds.includes(i.id))]
                return Observable.of(
                    $do.bcFetchDataSuccess({
                        bcName,
                        data: newData,
                        bcUrl,
                        hasNext: data.hasNext
                    })
                )
            })
            .catch((error: any) => {
                console.error(error)
                return Observable.of($do.bcFetchDataFail({ bcName, bcUrl }))
            })

        return Observable.race(cancelFlow, normalFlow)
    })

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const bcSelectRecord: Epic = (action$, store) =>
    action$.ofType(types.bcSelectRecord).mergeMap(action => {
        const { bcName, cursor } = action.payload
        const widgets = store.getState().view.widgets
        const bcMap = store.getState().screen.bo.bc
        const fetchChildrenBcData = Object.entries(getBcChildren(bcName, widgets, bcMap)).map(entry => {
            const [childBcName, widgetNames] = entry
            return $do.bcFetchDataRequest({
                bcName: childBcName,
                widgetName: widgetNames[0],
                ignorePageLimit: action.payload.ignoreChildrenPageLimit,
                keepDelta: action.payload.keepDelta
            })
        })
        return Observable.concat(
            Observable.of($do.bcChangeCursors({ cursorsMap: { [bcName]: cursor }, keepDelta: action.payload.keepDelta })),
            Observable.of($do.bcFetchRowMeta({ widgetName: '', bcName })),
            fetchChildrenBcData
        )
    })

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const inlinePickListFetchDataEpic: Epic = (action$, store) =>
    action$.ofType(types.inlinePickListFetchDataRequest).mergeMap(action => {
        const { bcName, searchSpec, searchString } = action.payload
        const bcUrl = buildBcUrl(bcName, false)
        const canceler = api.createCanceler()
        const cancelFlow = cancelRequestEpic(action$, cancelRequestActionTypes, canceler.cancel, $do.bcFetchDataFail({ bcName, bcUrl }))
        const normalFlow = api
            .fetchBcData(store.getState().screen.screenName, bcUrl, { [searchSpec + '.contains']: searchString }, canceler.cancelToken)
            .mergeMap(data => {
                return Observable.of($do.bcFetchDataSuccess({ bcName, data: data.data, bcUrl }))
            })
            .catch((error: any) => {
                console.error(error)
                return Observable.of($do.bcFetchDataFail({ bcName: action.payload.bcName, bcUrl }))
            })
        return Observable.race(cancelFlow, normalFlow)
    })

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const bcDeleteDataEpic: Epic = (action$, store) =>
    action$
        .ofType(types.sendOperation)
        .filter(action => matchOperationRole(OperationTypeCrud.delete, action.payload, store.getState()))
        .mergeMap(action => {
            const widgetName = action.payload.widgetName
            const state = store.getState()
            const bcName = action.payload.bcName
            const cursor = state.screen.bo.bc[bcName].cursor
            const bcUrl = buildBcUrl(bcName, true)
            const context = { widgetName: action.payload.widgetName }
            const isTargetFormatPVF = state.view.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            return api
                .deleteBcData(state.screen.screenName, bcUrl, context)
                .mergeMap(data => {
                    const postInvoke = data.postActions[0]
                    return Observable.concat(
                        isTargetFormatPVF ? Observable.of($do.bcCancelPendingChanges({ bcNames: [bcName] })) : Observable.empty<never>(),
                        Observable.of($do.bcFetchDataRequest({ bcName, widgetName })),
                        postInvoke
                            ? Observable.of($do.processPostInvoke({ bcName, postInvoke, cursor, widgetName }))
                            : Observable.empty<never>()
                    )
                })
                .catch((error: any) => {
                    console.log(error)
                    return Observable.of($do.bcDeleteDataFail({ bcName }))
                })
        })

/**
 * Works with assoc-lists, which doesn't call back-end's assoc methods
 *
 * @category Epics
 */
export const saveAssociationsPassive: Epic = (action$, store) =>
    action$
        .ofType(types.saveAssociations)
        .filter(action => {
            return !store.getState().view.popupData.active
        })
        .switchMap(action => {
            const state = store.getState()
            const {
                calleeBCName = action.payload.calleeBcName,
                associateFieldKey = action.payload.associateFieldKey
            } = state.view.popupData
            const cursor = state.screen.bo.bc[calleeBCName].cursor
            const recordPrevData = (state.data[calleeBCName].find(dataStateRecord => dataStateRecord.id === cursor)[associateFieldKey] ??
                []) as MultivalueSingleValue[]
            const newValues: AssociatedItem[] = []

            action.payload.bcNames.forEach(pendingBc => {
                const pendingChanges = state.view.pendingDataChanges[pendingBc] || {}
                Object.entries(pendingChanges).forEach(([id, item]) => {
                    newValues.push(item as AssociatedItem)
                })
            })

            const addedItems = newValues
                .filter(newItem => {
                    const isNew = !recordPrevData.find(prevItem => prevItem.id === newItem.id) && newItem._associate
                    return isNew
                })
                .map(newItem => ({
                    id: newItem.id,
                    options: {},
                    value: newItem._value as string
                }))

            const result = recordPrevData
                .filter(prevItem => {
                    const removedItem = newValues.find(item => item.id === prevItem.id)
                    if (removedItem && removedItem?._associate === false) {
                        return false
                    }
                    return true
                })
                .concat(...addedItems)

            return Observable.of(
                $do.changeDataItem({
                    bcName: calleeBCName,
                    cursor: cursor,
                    dataItem: {
                        [associateFieldKey]: result
                    }
                })
            )
        })

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const changeChildrenAssociations: Epic = (action$, store) =>
    action$.ofType(types.changeChildrenAssociations).mergeMap(action => {
        const state = store.getState()
        const data = state.data[action.payload.bcName]
        return Observable.of(
            $do.changeDataItems({
                bcName: action.payload.bcName,
                cursors: data.map(item => item.id),
                dataItems: data.map(item => ({
                    ...item,
                    _value: item[action.payload.assocValueKey],
                    _associate: action.payload.selected
                }))
            })
        )
    })

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const changeChildrenAssociationsSameBc: Epic = (action$, store) =>
    action$.ofType(types.changeChildrenAssociationsSameBc).mergeMap(action => {
        const state = store.getState()
        const data = state.depthData[action.payload.depth]?.[action.payload.bcName] || []
        return Observable.of(
            $do.changeDataItems({
                bcName: action.payload.bcName,
                cursors: data.map(item => item.id),
                dataItems: data.map(item => ({
                    ...item,
                    _value: item[action.payload.assocValueKey],
                    _associate: action.payload.selected
                }))
            })
        )
    })

/**
 * Change full hierarchy descendants association state.
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const changeDescendantsAssociationsFull: Epic = (action$, store) =>
    action$.ofType(types.changeDescendantsAssociationsFull).mergeMap(action => {
        const state = store.getState()
        const depth = action.payload.depth
        const data = state.data[action.payload.bcName]

        const targetData = (data || []).filter(item => item.level === depth && item.parentId === action.payload.parentId)

        const result: Array<Observable<AnyAction>> = [
            Observable.of(
                $do.changeDataItems({
                    bcName: action.payload.bcName,
                    cursors: targetData.map(item => item.id),
                    dataItems: targetData.map(item => ({
                        ...item,
                        _value: item[action.payload.assocValueKey],
                        _associate: action.payload.selected
                    }))
                })
            )
        ]

        targetData.forEach(targetDataItem => {
            if (data.find(dataItem => dataItem.parentId === targetDataItem.id)) {
                result.push(
                    Observable.of(
                        $do.changeDescendantsAssociationsFull({
                            ...action.payload,
                            parentId: targetDataItem.id,
                            depth: depth + 1
                        })
                    )
                )
            }
        })

        return Observable.concat(...result)
    })

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const changeAssociation: Epic = (action$, store) =>
    action$.ofType(types.changeAssociation).mergeMap(action => {
        const state = store.getState()
        const selected = action.payload.dataItem._associate
        const result: Array<Observable<AnyAction>> = [
            Observable.of(
                $do.changeDataItem({
                    bcName: action.payload.bcName,
                    cursor: action.payload.dataItem.id,
                    dataItem: action.payload.dataItem
                })
            )
        ]
        const widget = state.view.widgets.find(item => item.name === action.payload.widgetName) as WidgetTableMeta
        const isRoot = action.payload.bcName === widget.bcName
        const rootHierarchyDescriptor = { bcName: widget.bcName, radio: widget.options?.hierarchyRadio, fields: widget.fields }
        const hierarchy = widget.options?.hierarchy
        const hierarchyDescriptor: WidgetTableHierarchy = isRoot
            ? rootHierarchyDescriptor
            : hierarchy.find(item => item.bcName === action.payload.bcName)
        const hierarchyGroupSelection = widget.options?.hierarchyGroupSelection
        const hierarchyTraverse = widget.options?.hierarchyTraverse
        const childrenBc = hierarchy.slice(hierarchy.findIndex(item => item.bcName === action.payload.bcName) + 1).map(item => item.bcName)
        if (hierarchyGroupSelection && hierarchyDescriptor.radio && !selected) {
            result.push(
                Observable.of(
                    $do.dropAllAssociations({
                        bcNames: childrenBc
                    })
                )
            )
        }
        const parent: WidgetTableHierarchy = isRoot
            ? null
            : hierarchy.find((item, index) => {
                  return hierarchy[index + 1]?.bcName === action.payload.bcName
              }) || rootHierarchyDescriptor
        const parentItem = state.data[parent?.bcName]?.find(item => item.id === state.screen.bo.bc[parent?.bcName].cursor)
        if (parent && hierarchyTraverse && selected) {
            if (hierarchyDescriptor.radio) {
                result.push(
                    Observable.of(
                        $do.dropAllAssociations({
                            bcNames: [parent.bcName]
                        })
                    )
                )
            }
            result.push(
                Observable.of(
                    $do.changeAssociation({
                        bcName: parent.bcName,
                        widgetName: action.payload.widgetName,
                        dataItem: {
                            ...parentItem,
                            _associate: true,
                            _value: parentItem[parent.assocValueKey || action.payload.assocValueKey]
                        },
                        assocValueKey: action.payload.assocValueKey
                    })
                )
            )
        }
        if (parent && hierarchyTraverse && !selected) {
            const data = state.data[action.payload.bcName]
            const wasLastInData = data.filter(item => item.id !== action.payload.dataItem.id).every(item => !item._associate)

            const delta = state.view.pendingDataChanges[action.payload.bcName]
            const wasLastInDelta =
                !delta ||
                !Object.values(delta).find(deltaValue => {
                    return (
                        deltaValue._associate === true &&
                        deltaValue.id !== action.payload.dataItem.id &&
                        // Filter by data records, because delta can contain records from another hierarchy branch, but data always contains
                        // only target branch records, that we see in widget
                        data.find(dataValue => dataValue.id === deltaValue.id)
                    )
                })
            if (wasLastInData && wasLastInDelta) {
                result.push(
                    Observable.of(
                        $do.changeAssociation({
                            bcName: parent.bcName,
                            widgetName: action.payload.widgetName,
                            dataItem: { ...parentItem, _associate: false },
                            assocValueKey: action.payload.assocValueKey
                        })
                    )
                )
            }
        }
        return Observable.concat(...result)
    })

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const changeAssociationSameBc: Epic = (action$, store) =>
    action$.ofType(types.changeAssociationSameBc).mergeMap(action => {
        const bcName = action.payload.bcName
        const result: Array<Observable<AnyAction>> = [
            Observable.of(
                $do.changeDataItem({
                    bcName: bcName,
                    cursor: action.payload.dataItem.id,
                    dataItem: action.payload.dataItem
                })
            )
        ]

        const state = store.getState()
        const selected = action.payload.dataItem._associate
        const depth = action.payload.depth || 1
        const parentDepth = depth - 1
        const widget = state.view.widgets.find(item => item.name === action.payload.widgetName) as WidgetTableMeta
        const hierarchyTraverse = widget.options?.hierarchyTraverse

        const currentData = depth > 1 ? state.depthData[depth]?.[bcName] : state.data[bcName]

        const parentCursor = parentDepth
            ? parentDepth > 1
                ? state.screen.bo.bc[bcName].depthBc[parentDepth]?.cursor
                : state.screen.bo.bc[bcName].cursor
            : null

        const parentItem = parentCursor
            ? parentDepth > 1
                ? state.depthData[parentDepth]?.[bcName]?.find(item => item.id === parentCursor)
                : state.data[bcName].find(item => item.id === parentCursor)
            : null

        if (parentDepth && hierarchyTraverse && selected) {
            result.push(
                Observable.of(
                    $do.changeAssociationSameBc({
                        bcName,
                        depth: parentDepth,
                        widgetName: action.payload.widgetName,
                        dataItem: {
                            ...parentItem,
                            _associate: true,
                            _value: parentItem[action.payload.assocValueKey]
                        },
                        assocValueKey: action.payload.assocValueKey
                    })
                )
            )
        }

        if (parentDepth && hierarchyTraverse && !selected) {
            const wasLastInData = currentData.filter(item => item.id !== action.payload.dataItem.id).every(item => !item._associate)
            if (wasLastInData) {
                result.push(
                    Observable.of(
                        $do.changeAssociationSameBc({
                            bcName,
                            depth: parentDepth,
                            widgetName: action.payload.widgetName,
                            dataItem: { ...parentItem, _associate: false },
                            assocValueKey: action.payload.assocValueKey
                        })
                    )
                )
            }
        }

        return Observable.concat(...result)
    })

/**
 * Change full hierarchy record association state. Also select/deselect dependent records according to widget options.
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const changeAssociationFull: Epic = (action$, store) =>
    action$.ofType(types.changeAssociationFull).mergeMap(action => {
        const state = store.getState()
        const result: Array<Observable<AnyAction>> = []
        const assocValueKey = action.payload.assocValueKey || state.view.popupData?.assocValueKey
        const bcName = action.payload.bcName
        const allData = state.data[bcName]
        const selected = action.payload.dataItem._associate
        const depth = action.payload.depth || 1
        const parentDepth = depth - 1
        const parentItem = depth > 1 && allData.find(item => item.id === action.payload.dataItem.parentId)
        const widget = state.view.widgets.find(item => item.name === action.payload.widgetName) as WidgetTableMeta
        const hierarchyTraverse = widget.options?.hierarchyTraverse
        const rootRadio = widget.options?.hierarchyRadio
        const hierarchyGroupDeselection = widget.options?.hierarchyGroupDeselection

        const currentLevelData = allData.filter(item => item.level === depth && (item.level === 1 || item.parentId === parentItem?.id))

        if (rootRadio && hierarchyGroupDeselection && depth === 1) {
            if (selected) {
                const delta = state.view.pendingDataChanges[bcName]
                const prevSelected = allData.find(dataItem => {
                    if (dataItem.level === 1 && dataItem.id !== action.payload.dataItem.id) {
                        const deltaItem = delta?.[dataItem.id]
                        if (deltaItem?._associate || (!deltaItem && dataItem._associate)) {
                            return true
                        }
                    }

                    return false
                })

                if (prevSelected) {
                    result.push(
                        Observable.of(
                            $do.changeAssociationFull({
                                bcName,
                                depth: depth,
                                widgetName: action.payload.widgetName,
                                dataItem: { ...prevSelected, _associate: false },
                                assocValueKey
                            })
                        )
                    )
                }
            } else {
                // result.push(Observable.of($do.dropAllAssociationsFull({bcName, depth: depth + 1, dropDescendants: true})))
                result.push(
                    Observable.of(
                        $do.changeDescendantsAssociationsFull({
                            bcName,
                            parentId: action.payload.dataItem.id,
                            depth: depth + 1,
                            assocValueKey,
                            selected: false
                        })
                    )
                )
            }
        }

        result.push(
            Observable.of(
                $do.changeDataItem({
                    bcName: action.payload.bcName,
                    cursor: action.payload.dataItem.id,
                    dataItem: action.payload.dataItem
                })
            )
        )

        if (parentDepth && hierarchyTraverse && selected) {
            result.push(
                Observable.of(
                    $do.changeAssociationFull({
                        bcName,
                        depth: parentDepth,
                        widgetName: action.payload.widgetName,
                        dataItem: {
                            ...parentItem,
                            _associate: true,
                            _value: parentItem[assocValueKey]
                        },
                        assocValueKey
                    })
                )
            )
        }

        if (parentDepth && hierarchyTraverse && !selected) {
            const delta = state.view.pendingDataChanges[bcName]
            const wasLastInDelta =
                !delta ||
                !Object.values(delta).find(deltaValue => {
                    return (
                        deltaValue._associate === true &&
                        deltaValue.id !== action.payload.dataItem.id &&
                        currentLevelData.find(dataValue => dataValue.id === deltaValue.id)
                    )
                })
            const deltaFalseId =
                delta &&
                Object.values(delta)
                    ?.filter(item => item._associate === false)
                    .map(item => item.id)
            const wasLastInData = currentLevelData
                .filter(item => item.id !== action.payload.dataItem.id && !deltaFalseId?.includes(item.id))
                .every(item => !item._associate)

            if (wasLastInData && wasLastInDelta) {
                result.push(
                    Observable.of(
                        $do.changeAssociationFull({
                            bcName,
                            depth: parentDepth,
                            widgetName: action.payload.widgetName,
                            dataItem: { ...parentItem, _associate: false },
                            assocValueKey
                        })
                    )
                )
            }
        }

        return Observable.concat(...result)
    })

export const dataEpics = {
    bcFetchRowMetaRequest,
    bcFetchDataEpic,
    bcSelectRecord,
    bcSelectDepthRecord,
    inlinePickListFetchDataEpic,
    selectView,
    bcNewDataEpic,
    bcDeleteDataEpic,
    bcSaveDataEpic,
    bcCancelCreateDataEpic,
    saveAssociationsActive,
    saveAssociationsPassive,
    changeAssociation,
    changeAssociationSameBc,
    changeChildrenAssociations,
    changeChildrenAssociationsSameBc,
    changeAssociationFull,
    changeDescendantsAssociationsFull,
    bcLoadMore,
    removeMultivalueTag
}

export default dataEpics
