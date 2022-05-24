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

import { of as observableOf, concat as observableConcat, Observable } from 'rxjs'
import { catchError, mergeMap, switchMap } from 'rxjs/operators'
import { $do, Epic, types } from '../../actions/actions'
import { refreshMeta } from '../../api'
import { ofType } from 'redux-observable'

/**
 * Performed on refresh meta data process.
 *
 * @param action$ This epic will fire on {@link ActionPayloadTypes.refreshMeta | refreshMeta} action
 * @param store$
 * @category Epics
 */
export const refreshMetaEpic: Epic = (action$, store$): Observable<any> =>
    action$.pipe(
        ofType(types.refreshMeta),
        mergeMap(() => {
            const state = store$.value
            const { router } = state
            const { activeRole } = state.session
            return refreshMeta().pipe(
                switchMap(() => {
                    return observableConcat([
                        $do.logoutDone(null),
                        $do.login({ login: null, password: null, role: activeRole }),
                        $do.changeLocation({
                            location: router,
                            action: 'PUSH'
                        })
                    ]).pipe(catchError(error => observableOf($do.loginFail(error))))
                })
            )
        })
    )
