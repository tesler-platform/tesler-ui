/*
 * TESLER-UI
 * Copyright (C) 2018-2021 Tesler Contributors
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

import { of as observableOf, concat as observableConcat, Observable, EMPTY } from 'rxjs'
import { switchMap, map, catchError, mergeMap } from 'rxjs/operators'
import { Epic, types, AnyAction, ActionsMap, $do } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { fetchRowMeta } from '../../api/api'
import { buildBcUrl } from '../../utils/strings'
import { WidgetFieldBase } from '../../interfaces/widget'
import { DrillDownType } from '../../interfaces/router'
import { ofType, StateObservable } from 'redux-observable'

/**
 *
 * @param action$
 * @param store$
 * @param store
 * @category Epics
 */
export const userDrillDown: Epic = (action$, store$, { store }) =>
    action$.pipe(
        ofType(types.userDrillDown),
        map(action => {
            const state = store$.value
            const widget = state.view.widgets.find(item => item.name === action.payload.widgetName)
            const cursor = state.screen.bo.bc[widget?.bcName]?.cursor

            if (cursor !== action.payload.cursor) {
                store.dispatch($do.bcChangeCursors({ cursorsMap: { [action.payload.bcName]: action.payload.cursor } }))
            }
            return action
        }),
        switchMap(action => {
            return userDrillDownImpl(action, store$)
        })
    )

/**
 * Default implementation for `userDrillDown` epic.
 *
 * Sends a request to fetch row meta; will write a console error if request fails.
 * Otherwise a chain of actions will be dispatched:
 *
 * - {@link ActionPayloadTypes.bcFetchRowMetaSuccess | bcFetchRowMetaSuccess} for drilldowns not of {@link DrillDownType.inner | DrillDownType.inner} type
 * - {@link ActionPayloadTypes.userDrillDownSuccess | userDrillDownSuccess}
 * - {@link ActionPayloadTypes.drillDown | drillDown}
 *
 * Drilldown url is taken from {@link WidgetFieldBase.drillDown | WidgetField.drillDown} property in widget meta configuration or from record
 * directly if record's property specified in {@link WidgetFieldBase.drillDownKey | WidgetField.drillDownKey}
 *
 * @param action This epic will fire on {@link ActionPayloadTypes.userDrillDown | userDrillDown} action
 * @param store$
 * @category Epics
 */
export function userDrillDownImpl(action: ActionsMap['userDrillDown'], store$: StateObservable<CoreStore>): Observable<AnyAction> {
    const state = store$.value
    const { bcName, fieldKey, cursor } = action.payload
    const bcUrl = buildBcUrl(bcName, true)
    const fetch = fetchRowMeta(state.screen.screenName, bcUrl)
    return fetch.pipe(
        mergeMap(rowMeta => {
            const drillDownField = rowMeta.fields.find(field => field.key === fieldKey)
            const route = state.router
            const drillDownKey = (state.view.widgets
                .find(widget => widget.bcName === bcName)
                ?.fields.find((field: WidgetFieldBase) => field.key === fieldKey) as WidgetFieldBase)?.drillDownKey
            const customDrillDownUrl = state.data[bcName]?.find(record => record.id === cursor)?.[drillDownKey] as string
            /**
             * It seems that behavior is wrong here; matching route condition will probably never be hit
             *
             * TODO: Review this case and either make condition strict or remove it completely
             */
            return customDrillDownUrl || drillDownField?.drillDown || drillDownField?.drillDown !== route.path
                ? observableConcat(
                      drillDownField.drillDownType !== DrillDownType.inner
                          ? observableOf($do.bcFetchRowMetaSuccess({ bcName, rowMeta, bcUrl, cursor }))
                          : EMPTY,
                      observableOf($do.userDrillDownSuccess({ bcName, bcUrl, cursor })),
                      observableOf(
                          $do.drillDown({
                              url: customDrillDownUrl || drillDownField.drillDown,
                              drillDownType: drillDownField.drillDownType as DrillDownType,
                              route
                          })
                      )
                  )
                : EMPTY
        }),
        catchError(error => {
            console.error(error)
            return EMPTY // TODO:
        })
    )
}
