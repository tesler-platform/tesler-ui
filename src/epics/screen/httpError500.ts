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

import { of as observableOf, Observable } from 'rxjs'
import { mergeMap, filter } from 'rxjs/operators'
import { Epic, types, AnyAction, ActionsMap, $do } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { ApplicationErrorType, SystemError } from '../../interfaces/view'
import { ofType, StateObservable } from 'redux-observable'

export const httpError500: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.httpError),
        filter(action => action.payload.statusCode === 500),
        mergeMap(action => {
            return httpError500Impl(action, store$)
        })
    )

/**
 *
 * @param action
 * @param store$
 * @category Epics
 */
export function httpError500Impl(action: ActionsMap['httpError'], store$: StateObservable<CoreStore>): Observable<AnyAction> {
    const systemError: SystemError = {
        type: ApplicationErrorType.SystemError,
        details: action.payload.error.response.statusText,
        error: action.payload.error
    }
    return observableOf($do.showViewError({ error: systemError }))
}
