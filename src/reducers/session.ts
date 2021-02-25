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
    debugMode: false,
    exportStateEnabled: false,
    active: false,
    loginSpin: false,
    errorMsg: null,
    screens: []
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
            return { ...state, loginSpin: false, active: true, screens: action.payload.screens || [] }
        }
        case types.loginFail: {
            return { ...state, loginSpin: false, errorMsg: action.payload.errorMsg }
        }
        case types.switchDebugMode: {
            return { ...state, debugMode: action.payload }
        }
        default:
            return state
    }
}

export default session
