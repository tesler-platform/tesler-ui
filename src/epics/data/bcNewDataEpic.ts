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

import { of as observableOf, concat as observableConcat, Observable, EMPTY } from 'rxjs'
import { mergeMap, filter, catchError } from 'rxjs/operators'
import { Epic, types, $do, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { buildBcUrl } from '../../utils/strings'
import { newBcData } from '../../api/api'
import { matchOperationRole } from '../../utils/operations'
import { OperationTypeCrud } from '../../interfaces/operation'
import { DataItem } from '../../interfaces/data'
import { ofType, StateObservable } from 'redux-observable'

/**
 * Access `row-meta-new` API endpoint for business component endpoint; response will contain
 * row meta where `currentValue` of `id` field will contain an id for newly created record.
 *
 * `bcNewDataSuccess` action dispatched with new data item draft (vstamp = -1).
 * `bcFetchRowMetaSuccess` action dispatched to set BC cursor to this new id.
 * `changeDataItem` action dispatched to add this new item to pending changes.
 * `processPostInvoke` dispatched to handle possible post invokes.
 *
 * In case of an error message is logged as warning and `bcNewDataFail` action dispatched.
 *
 * @param action$ `sendOperation` with `create` role
 * @param store$
 */
export const bcNewDataEpic: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.sendOperation),
        filter(action => matchOperationRole(OperationTypeCrud.create, action.payload, store$.value)),
        mergeMap(action => {
            return bcNewDataEpicImpl(action, store$)
        })
    )

/**
 * Default implementation for `bcNewDataEpic` epic
 *
 * Access `row-meta-new` API endpoint for business component endpoint; response will contain
 * row meta where `currentValue` of `id` field will contain an id for newly created record.
 *
 * `bcNewDataSuccess` action dispatched with new data item draft (vstamp = -1).
 * `bcFetchRowMetaSuccess` action dispatched to set BC cursor to this new id.
 * `changeDataItem` action dispatched to add this new item to pending changes.
 * `processPostInvoke` dispatched to handle possible post invokes.
 *
 * In case of an error message is logged as warning and `bcNewDataFail` action dispatched.
 *
 * @param action `sendOperation` with `create` role
 * @param store$
 * @category Epics
 */
export function bcNewDataEpicImpl(action: ActionsMap['sendOperation'], store$: StateObservable<CoreStore>): Observable<AnyAction> {
    const state = store$.value
    const bcName = action.payload.bcName
    const bcUrl = buildBcUrl(bcName)
    const context = { widgetName: action.payload.widgetName }
    const params = { _action: action.payload.operationType }
    return newBcData(state.screen.screenName, bcUrl, context, params).pipe(
        mergeMap(data => {
            const rowMeta = data.row
            const dataItem: DataItem = { id: null, vstamp: -1 }
            data.row.fields.forEach(field => {
                dataItem[field.key] = field.currentValue
            })
            const postInvoke = data.postActions[0]
            const cursor = dataItem.id
            return observableConcat(
                observableOf($do.bcNewDataSuccess({ bcName, dataItem, bcUrl })),
                observableOf($do.bcFetchRowMetaSuccess({ bcName, bcUrl: `${bcUrl}/${cursor}`, rowMeta, cursor })),
                observableOf(
                    $do.changeDataItem({
                        bcName: action.payload.bcName,
                        cursor: cursor,
                        dataItem: {
                            id: cursor
                        }
                    })
                ),
                postInvoke
                    ? observableOf($do.processPostInvoke({ bcName, postInvoke, cursor, widgetName: action.payload.widgetName }))
                    : EMPTY
            )
        }),
        catchError((error: any) => {
            console.error(error)
            return observableOf($do.bcNewDataFail({ bcName }))
        })
    )
}
