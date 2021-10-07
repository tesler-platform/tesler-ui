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

import { $do } from '../../actions/actions'
import { session, initialState } from '../session'
import { SessionScreen, Session, PendingRequest } from '../../interfaces/session'

describe('session reducer', () => {
    it('sets login spinner and clears session error message on `login` action', () => {
        const state = { ...initialState, errorMsg: 'Your password is incorrect' }
        expect(state.loginSpin).toBe(false)
        const nextState = session(state, $do.login({ login: 'kevin', password: 'weatherman' }))
        expect(nextState.loginSpin).toBe(true)
        expect(nextState.errorMsg).toBeFalsy()
    })

    it('sets session active, clears login spinner and sets screens available for the session on `loginDone` action', () => {
        const state = { ...initialState, loginSpin: true }
        const screens: SessionScreen[] = [{ id: '1', name: '1', text: '1', url: '1', primary: '' }]
        expect(state.active).toBe(false)
        let nextState = session(
            state,
            $do.loginDone({ screens, activeRole: null, firstName: null, lastName: null, login: null, roles: null })
        )
        expect(nextState.loginSpin).toBe(false)
        expect(nextState.active).toBe(true)
        expect(nextState.screens).toEqual(screens)
        nextState = session(
            state,
            $do.loginDone({ screens: null, activeRole: null, firstName: null, lastName: null, login: null, roles: null })
        )
        expect(nextState.screens.length).toBe(0)
    })

    it('clears login spinner and sets session error message on `loginFail` action', () => {
        const state = { ...initialState, loginSpin: true }
        expect(state.loginSpin).toBe(true)
        const nextState = session(state, $do.loginFail({ errorMsg: 'Your password expired' }))
        expect(nextState.loginSpin).toBe(false)
        expect(nextState.errorMsg).toBe('Your password expired')
    })

    it('should switch Debug Mode', () => {
        const state = { ...initialState }
        const nextState = session(state, $do.switchDebugMode(true))
        expect(nextState.debugMode).toBe(true)
    })

    it('handles pending requests', () => {
        const state: Session = { ...initialState, pendingRequests: [] }
        const request1: PendingRequest = { type: 'force-active', requestId: '183ff8de-d43b-489d-b978-13220d10dcac' }
        const request2: PendingRequest = { type: 'force-active', requestId: '283ff8de-d43b-489d-b978-13220d10dcac' }
        let nextState = session(state, $do.addPendingRequest({ request: request1 }))
        expect(nextState.pendingRequests[0]).toBe(request1)
        nextState = session(nextState, $do.addPendingRequest({ request: request2 }))
        expect(nextState.pendingRequests[1]).toBe(request2)
        nextState = session(nextState, $do.removePendingRequest({ requestId: request1.requestId }))
        expect(nextState.pendingRequests[0]).toBe(request2)
        expect(nextState.pendingRequests.length).toBe(1)
    })
})
