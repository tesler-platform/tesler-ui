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

import { EMPTY, Observable } from 'rxjs'
import { catchError, mergeMap, switchMap } from 'rxjs/operators'
import { Epic, types, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { routerRequest } from '../../api/api'
import { ofType, StateObservable } from 'redux-observable'

export const handleRouter: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.handleRouter),
        switchMap(action => {
            return handleRouterImpl(action, store$)
        })
    )

/**
 * Default implementation for `handleRouter` epic.
 *
 * If server routing is used, this epic will send a requst to Tesler API router endpoint.
 * It writes a console error if request fails.
 *
 * @param action This epic will fire on {@link ActionPayloadTypes.handleRouter | handleRouter} action
 * @param store$
 * @returns Default implementation does not throw any additional actions
 * @category Epics
 */
export function handleRouterImpl(action: ActionsMap['handleRouter'], store$: StateObservable<CoreStore>): Observable<never> {
    const path = action.payload.path
    const params = action.payload.params
    // todo: Handle errors
    return routerRequest(path, params).pipe(
        mergeMap(data => {
            return EMPTY
        }),
        catchError(error => {
            console.error(error)
            return EMPTY
        })
    )
}
