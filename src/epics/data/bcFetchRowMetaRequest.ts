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

import {Observable} from 'rxjs'
import {Store, AnyAction} from 'redux'
import {Epic, types, $do,  ActionsMap} from '../../actions/actions'
import {Store as CoreStore} from '../../interfaces/store'
import {buildBcUrl} from '../../utils/strings'
import {createCanceler, fetchRowMeta} from '../../api/api'
import {cancelRequestActionTypes, cancelRequestEpic} from '../../utils/cancelRequestEpic'
import {ActionsObservable} from 'redux-observable'

export const bcFetchRowMetaRequest: Epic = (action$, store) => action$.ofType(types.bcFetchRowMeta)
.mergeMap((action) => {
    return bcFetchRowMetaRequestImpl(action, store, action$)
})

export function bcFetchRowMetaRequestImpl(
    action: ActionsMap['bcFetchRowMeta'],
    store: Store<CoreStore, AnyAction>,
    actionObservable: ActionsObservable<AnyAction>
) {
    const state = store.getState()
    const screenName = state.screen.screenName
    const bcName = action.payload.bcName
    const cursor = state.screen.bo.bc[bcName].cursor
    const bcUrl = buildBcUrl(bcName, true)
    const canceler = createCanceler()
    const cancelFlow = cancelRequestEpic(
        actionObservable,
        cancelRequestActionTypes,
        canceler.cancel,
        $do.bcFetchRowMetaFail({ bcName })
    )
    const cancelByParentBc = cancelRequestEpic(
        actionObservable,
        [types.bcSelectRecord],
        canceler.cancel,
        $do.bcFetchRowMetaFail({ bcName }),
        (filteredAction) => {
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
    return Observable.race(cancelFlow, cancelByParentBc, normalFlow)
}
