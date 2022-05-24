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

import { of as observableOf, Observable, EMPTY } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { Epic, types, $do, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { ApplicationErrorType } from '../../interfaces/view'
import axios from 'axios'
import { ofType, StateObservable } from 'redux-observable'

export const knownHttpErrors = [401, 409, 418, 500]

export const apiError: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.apiError),
        mergeMap(action => {
            return apiErrorImpl(action, store$)
        })
    )

/**
 *
 * @param action
 * @param store$
 * @category Epics
 */
export function apiErrorImpl(action: ActionsMap['apiError'], store$: StateObservable<CoreStore>): Observable<AnyAction> {
    const { error, callContext } = action.payload
    if (error.response) {
        return observableOf(
            $do.httpError({
                statusCode: error.response.status,
                error,
                callContext
            })
        )
    } else if (!axios.isCancel(error)) {
        return observableOf(
            $do.showViewError({
                error: {
                    type: ApplicationErrorType.NetworkError
                }
            })
        )
    }
    return EMPTY
}
