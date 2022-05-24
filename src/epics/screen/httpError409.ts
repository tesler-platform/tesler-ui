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
import { Epic, types, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { openButtonWarningNotification } from '../../utils/notifications'
import { ofType, StateObservable } from 'redux-observable'

export const httpError409: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.httpError),
        filter(action => action.payload.statusCode === 409),
        mergeMap(action => {
            return httpError409Impl(action, store$)
        })
    )

/**
 *
 * @param action
 * @param store$
 * @category Epics
 */
export function httpError409Impl(action: ActionsMap['httpError'], store$: StateObservable<CoreStore>): Observable<AnyAction> {
    const notificationMessage = action.payload.error.response.data.error?.popup?.[0] || ''
    openButtonWarningNotification(notificationMessage, 'OK', 0, null, 'action_edit_error')
    return EMPTY
}
