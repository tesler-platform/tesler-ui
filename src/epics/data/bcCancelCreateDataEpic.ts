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
import { Store } from 'redux'
import { Epic, types, $do, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { buildBcUrl } from '../../utils/strings'
import { customAction } from '../../api/api'
import { matchOperationRole } from '../../utils/operations'
import { OperationTypeCrud } from '../../interfaces/operation'

/**
 * Sends `cancel-create` custom operation with record's pending changes and vstamp;
 * Dispatches `sendOperationSuccess` and `bcChangeCursors` to drop cursors, also
 * `processPostInvoke` if received `postActions` in response.
 *
 * @param action sendOperation with `cancel-create` role
 * @param store Store instance
 */

export const bcCancelCreateDataEpic: Epic = (action$, store) =>
    action$
        .ofType(types.sendOperation)
        .filter(action => matchOperationRole(OperationTypeCrud.cancelCreate, action.payload, store.getState()))
        .mergeMap(action => {
            return bcCancelCreateDataEpicImpl(action, store)
        })

/**
 * Default implementation for `bcCancelCreateDataEpic` epic
 *
 * Sends `cancel-create` custom operation with record's pending changes and vstamp;
 * Dispatches `sendOperationSuccess` and `bcChangeCursors` to drop cursors, also
 * `processPostInvoke` if received `postActions` in response.
 *
 * On error dispatches `bcDeleteDataFail`.
 *
 * @param action sendOperation with `cancel-create` role
 * @param store Store instance
 */
export function bcCancelCreateDataEpicImpl(action: ActionsMap['sendOperation'], store: Store<CoreStore, AnyAction>) {
    const state = store.getState()
    const screenName = state.screen.screenName
    const bcName = action.payload.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const bc = state.screen.bo.bc[bcName]
    const cursor = bc?.cursor
    const context = { widgetName: action.payload.widgetName }
    const record = state.data[bcName]?.find(item => item.id === bc.cursor)
    const pendingRecordChange = state.view.pendingDataChanges[bcName]?.[bc.cursor]
    const data = record && { ...pendingRecordChange, vstamp: record.vstamp }
    const params = { _action: action.payload.operationType }
    const cursorsMap: Record<string, string> = { [action.payload.bcName]: null }
    return customAction(screenName, bcUrl, data, context, params)
        .mergeMap(response => {
            const postInvoke = response.postActions[0]
            return Observable.concat(
                Observable.of($do.sendOperationSuccess({ bcName, cursor })),
                Observable.of($do.bcChangeCursors({ cursorsMap })),
                postInvoke
                    ? Observable.of($do.processPostInvoke({ bcName, postInvoke, cursor, widgetName: context.widgetName }))
                    : Observable.empty<never>()
            )
        })
        .catch((error: any) => {
            console.error(error)
            return Observable.of($do.bcDeleteDataFail({ bcName }))
        })
}
