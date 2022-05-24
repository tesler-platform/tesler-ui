import { of as observableOf } from 'rxjs'

import { switchMap, filter, catchError, mergeMap } from 'rxjs/operators'
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

import { $do, ActionsMap, Epic, types } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { loginByRoleRequest } from '../../api'
import { LoginResponse } from '../../interfaces/session'
import { changeLocation } from '../../reducers/router'
import { AxiosError } from 'axios'
import i18n from 'i18next'
import { ofType, StateObservable } from 'redux-observable'

const responseStatusMessages: Record<number, string> = {
    401: i18n.t('Invalid credentials'),
    403: i18n.t('Access denied')
}

/**
 * Performed on role switching
 *
 * @param action$ This epic will fire on {@link ActionPayloadTypes.login | login} action
 * @param store$
 * @category Epics
 */
export const loginByAnotherRoleEpic: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.login),
        filter(action => !!action.payload?.role),
        switchMap(action => {
            return loginByAnotherRoleEpicImpl(action, store$)
        })
    )

/**
 * Default implementation of `loginByAnotherRoleEpic` epic
 *
 * Performs login request with `role` parameter
 *
 * If `role` changed, epic changes location to default view
 *
 * @param action action {@link ActionPayloadTypes.login | login}
 * @param store$
 * @category Epics
 */
export function loginByAnotherRoleEpicImpl(action: ActionsMap['login'], store$: StateObservable<CoreStore>) {
    const { role } = action.payload
    const isSwitchRole = role && role !== store$.value.session.activeRole
    return loginByRoleRequest(role).pipe(
        mergeMap((data: LoginResponse) => {
            if (isSwitchRole) {
                const defaultScreen = data.screens.find(screen => screen.defaultScreen) || data.screens[0]
                const defaultViewName = defaultScreen?.primary ?? defaultScreen.meta.views[0].name
                const defaultView = defaultScreen?.meta.views.find(view => defaultViewName === view.name)
                if (defaultView) changeLocation(defaultView.url)
            }
            return observableOf(
                $do.loginDone({
                    devPanelEnabled: data.devPanelEnabled,
                    activeRole: data.activeRole,
                    roles: data.roles,
                    screens: data.screens,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    login: data.login
                })
            )
        }),
        catchError((error: AxiosError) => {
            console.error(error)
            const errorMsg = error.response
                ? responseStatusMessages[error.response.status] || 'Server application unavailable'
                : 'Empty server response'
            return observableOf($do.loginFail({ errorMsg }))
        })
    )
}
