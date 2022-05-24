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

import { of as observableOf, Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { Epic, types, AnyAction, ActionsMap, $do } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { RouteType } from '../../interfaces/router'
import { ofType, StateObservable } from 'redux-observable'

/**
 * Fires `selectScreen` or `selectScreenFail` to set requested in url screen as active
 * after succesful login.
 *
 * For server-side router fires `handleRouter` instead.
 *
 * @param action$ loginDone
 * @param store$
 */
export const loginDone: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.loginDone),
        switchMap(action => {
            return loginDoneImpl(action, store$)
        })
    )

/**
 *
 * @param action
 * @param store$
 * @category Epics
 */
export function loginDoneImpl(action: ActionsMap['loginDone'], store$: StateObservable<CoreStore>): Observable<AnyAction> {
    const state = store$.value

    if (state.router.type === RouteType.router) {
        return observableOf($do.handleRouter(state.router))
    }

    const nextScreenName = state.router.screenName
    const nextScreen =
        state.session.screens.find(item => (nextScreenName ? item.name === nextScreenName : item.defaultScreen)) || state.session.screens[0]
    return nextScreen
        ? observableOf<AnyAction>($do.selectScreen({ screen: nextScreen }))
        : observableOf<AnyAction>($do.selectScreenFail({ screenName: nextScreenName }))
}
