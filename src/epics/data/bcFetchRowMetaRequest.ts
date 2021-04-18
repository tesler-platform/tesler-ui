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

import { Observable } from 'rxjs'
import { Store, AnyAction } from 'redux'
import { Epic, types, $do, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { buildBcUrl } from '../../utils/strings'
import { createCanceler, fetchRowMeta } from '../../api/api'
import { cancelRequestActionTypes, cancelRequestEpic } from '../../utils/cancelRequestEpic'
import { ActionsObservable } from 'redux-observable'

/**
 * Access `row-meta` API endpoint for business component; response will contain information
 * about operations available for row and additional information about row fields.
 *
 * On success, {@link ActionPayloadTypes.bcFetchRowMetaSuccess | bcFetchRowMetaSuccess} action dispatched
 * to store received row meta.
 * On failure, console.error called and {@link ActionPayloadTypes.bcFetchRowMetaFail | bcFetchRowMetaFail} action
 * dispatched to drop fetching state.
 *
 * If any action from `cancelRequestActionTypes` array dispatched while this epic is in progress,
 * this epic will be cancelled and {@link ActionPayloadTypes.bcFetchRowMetaFail | bcFetchRowMetaFail} action
 * will be dispatched.
 *
 * @param action {@link ActionPayloadTypes.bcFetchRowMeta | bcFetchRowMeta}
 * @param store Store instance
 * @category Epics
 */
export const bcFetchRowMetaRequest: Epic = (action$, store) =>
    action$.ofType(types.bcFetchRowMeta).mergeMap(action => {
        return bcFetchRowMetaRequestImpl(action, store, action$)
    })

/**
 * Default implementation for `bcFetchRowMetaRequest` epic
 *
 * Access `row-meta` API endpoint for business component; response will contain information
 * about operations available for row and additional information about row fields.
 *
 * On success, {@link ActionPayloadTypes.bcFetchRowMetaSuccess | bcFetchRowMetaSuccess} action dispatched
 * to store received row meta.
 * On failure, console.error called and {@link ActionPayloadTypes.bcFetchRowMetaFail | bcFetchRowMetaFail} action
 * dispatched to drop fetching state.
 *
 * If any action from `cancelRequestActionTypes` array dispatched while this epic is in progress,
 * this epic will be cancelled and {@link ActionPayloadTypes.bcFetchRowMetaFail | bcFetchRowMetaFail} action
 * will be dispatched.
 *
 * @param action {@link ActionPayloadTypes.bcFetchRowMeta | bcFetchRowMeta}
 * @param store Store instance
 * @param actionObservable Root epic to cancel
 * @category Epics
 */
export function bcFetchRowMetaRequestImpl(
    action: ActionsMap['bcFetchRowMeta'],
    store: Store<CoreStore, AnyAction>,
    actionObservable: ActionsObservable<AnyAction>
): Observable<AnyAction> {
    const [cancelFlow, cancelByParentBc, normalFlow] = bcFetchRowMetaRequestCompatibility(action, store, actionObservable)
    return Observable.race(cancelFlow, cancelByParentBc, normalFlow)
}

/**
 * Compatibility for testing cancellable epics
 *
 * TODO: Move in `bcFetchRowMetaRequestImpl` in 2.0.0
 */
export function bcFetchRowMetaRequestCompatibility(
    action: ActionsMap['bcFetchRowMeta'],
    store: Store<CoreStore, AnyAction>,
    actionObservable: ActionsObservable<AnyAction>
): Array<Observable<AnyAction>> {
    const state = store.getState()
    const screenName = state.screen.screenName
    const bcName = action.payload.bcName
    const cursor = state.screen.bo.bc[bcName].cursor
    const bcUrl = buildBcUrl(bcName, true)
    const canceler = createCanceler()
    const cancelFlow = cancelRequestEpic(actionObservable, cancelRequestActionTypes, canceler.cancel, $do.bcFetchRowMetaFail({ bcName }))
    const cancelByParentBc = cancelRequestEpic(
        actionObservable,
        [types.bcSelectRecord],
        canceler.cancel,
        $do.bcFetchRowMetaFail({ bcName }),
        filteredAction => {
            const actionBc = filteredAction.payload.bcName
            return state.screen.bo.bc[bcName].parentName === actionBc
        }
    )
    const normalFlow = fetchRowMeta(screenName, bcUrl, undefined, canceler.cancelToken)
        .map(rowMeta => {
            return $do.bcFetchRowMetaSuccess({ bcName, rowMeta, bcUrl, cursor })
        })
        .catch(error => {
            console.error(error)
            return Observable.of($do.bcFetchRowMetaFail({ bcName }))
        })
    return [cancelFlow, cancelByParentBc, normalFlow]
}
