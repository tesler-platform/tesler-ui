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

import { concat as observableConcat } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { $do, Epic, types } from '../../actions/actions'
import { ofType } from 'redux-observable'

/**
 * Activates process of role switching
 *
 * @param action$ This epic will fire on {@link ActionPayloadTypes.switchRole | switchRole} action
 * @param store$
 * @category Epics
 */
export const switchRoleEpic: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.switchRole),
        switchMap(action => {
            return observableConcat([$do.logoutDone(null), $do.login({ login: null, password: null, role: action.payload.role })])
        })
    )
