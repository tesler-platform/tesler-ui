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
import { Epic, types, AnyAction, ActionsMap, $do } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { ApplicationErrorType } from '../../interfaces/view'
import { knownHttpErrors } from './apiError'

export const httpErrorDefault: Epic = (action$, store) =>
    action$
        .ofType(types.httpError)
        .filter(action => !knownHttpErrors.includes(action.payload.statusCode))
        .mergeMap(action => {
            return httpErrorDefaultImpl(action, store)
        })

export function httpErrorDefaultImpl(action: ActionsMap['httpError'], store: Store<CoreStore, AnyAction>) {
    const businessError = {
        type: ApplicationErrorType.BusinessError,
        code: action.payload.error.response.status,
        details: action.payload.error.response.data
    }
    return Observable.of($do.showViewError({ error: businessError }))
}
