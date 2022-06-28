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

import { AnyAction, types } from '../actions/actions'
import { Session } from '../interfaces/session'

export const initialState: Session = {
    devPanelEnabled: false,
    activeRole: null,
    roles: null,
    firstName: '',
    lastName: '',
    login: '',
    debugMode: false,
    exportStateEnabled: false,
    active: false,
    logout: false,
    loginSpin: false,
    errorMsg: null,
    screens: [],
    pendingRequests: [],
    notifications: []
}

/**
 * Session reducer
 *
 * Stores information about currently active session and data that should be persistent during all period of
 * user interaction with application.
 *
 * @param state Session branch of Redux store
 * @param action Redux action
 * @param store Store instance for read-only access of different branches of Redux store
 */
export function session(state = initialState, action: AnyAction): Session {
    switch (action.type) {
        case types.login: {
            return { ...state, loginSpin: true, errorMsg: null }
        }
        case types.loginDone: {
            const loginResponse = action.payload
            return {
                ...state,
                devPanelEnabled: loginResponse.devPanelEnabled,
                activeRole: loginResponse.activeRole,
                roles: loginResponse.roles,
                firstName: loginResponse.firstName,
                lastName: loginResponse.lastName,
                login: loginResponse.login,
                loginSpin: false,
                active: true,
                logout: false,
                screens: loginResponse.screens || []
            }
        }
        case types.loginFail: {
            return { ...state, loginSpin: false, errorMsg: action.payload.errorMsg }
        }
        case types.logout: {
            return {
                ...state,
                loginSpin: false,
                active: false,
                logout: true
            }
        }
        case types.switchDebugMode: {
            return { ...state, debugMode: action.payload }
        }
        case types.addPendingRequest: {
            return { ...state, pendingRequests: [...state.pendingRequests, action.payload.request] }
        }
        case types.removePendingRequest: {
            return {
                ...state,
                pendingRequests: state.pendingRequests.filter(item => item.requestId !== action.payload.requestId)
            }
        }
        case types.addNotification: {
            const notification = action.payload

            return {
                ...state,
                notifications: [...state.notifications, notification]
            }
        }
        case types.removeNotifications: {
            const notificationClosingKeys = action.payload

            const newNotifications = state.notifications.filter(notification => !notificationClosingKeys.includes(notification.key))

            return {
                ...state,
                notifications: newNotifications
            }
        }
        default:
            return state
    }
}

export default session
