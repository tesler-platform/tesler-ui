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

import { EMPTY, Observable } from 'rxjs'
import { mergeMap, filter } from 'rxjs/operators'
import { Epic, types, $do, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { historyObj } from '../../reducers/router'
import { ofType } from 'redux-observable'
import { Store } from 'redux'

export const httpError401: Epic = (action$, store$, { store }) =>
    action$.pipe(
        ofType(types.httpError),
        filter(action => action.payload.statusCode === 401),
        mergeMap(action => {
            return httpError401Impl(action, store)
        })
    )

/**
 *
 * @param action
 * @param store
 * @category Epics
 */
export function httpError401Impl(action: ActionsMap['httpError'], store: Store<CoreStore, AnyAction>): Observable<AnyAction> {
    store.dispatch($do.logoutDone(null))
    historyObj.push('/')
    return EMPTY
}
