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

import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { loginByRoleRequest } from '../../../api'
import { Observable } from 'rxjs'
import * as api from '../../../api/api'
import { $do } from '../../../actions/actions'
import { loginByAnotherRoleEpic } from '../loginByAnotherRole'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import * as router from '../../../reducers/router'
import * as response from './__mocks__/response.json'

const loginByRoleRequestMock = jest.fn().mockImplementation((...args: Parameters<typeof loginByRoleRequest>) => {
    const [role] = args
    switch (role) {
        case 'Auditor':
            return Observable.of({ ...response, activeRole: role })
        case 'Reader':
            return Observable.of({
                ...response,
                activeRole: role,
                screens: [{ ...response.screens[0], defaultScreen: true }, { ...response.screens[1] }]
            })
        case 'error': {
            return Observable.of(jest.fn().mockImplementationOnce(() => Promise.reject(new Error('test request crash'))))
        }
        default:
            return Observable.of(response)
    }
})
const consoleMock = jest.fn().mockImplementation(e => console.warn(e))
const historyObjMock = jest.fn()
jest.spyOn<any, any>(api, 'loginByRoleRequest').mockImplementation(loginByRoleRequestMock)
jest.spyOn(console, 'error').mockImplementation(consoleMock)
jest.spyOn(router, 'changeLocation').mockImplementation(historyObjMock)
describe('loginByAnotherRoleEpic test', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })
    beforeEach(() => {
        store.getState().session = {
            ...store.getState().session,
            activeRole: 'ADMIN',
            roles: [
                {
                    type: null,
                    key: 'Auditor',
                    value: 'Auditor',
                    description: null,
                    language: null,
                    displayOrder: null,
                    active: true,
                    cacheLoaderName: null
                },
                {
                    type: null,
                    key: 'Reader',
                    value: 'Reader',
                    description: null,
                    language: null,
                    displayOrder: null,
                    active: true,
                    cacheLoaderName: null
                },
                {
                    type: null,
                    key: 'ADMIN',
                    value: 'Administrator',
                    description: null,
                    language: null,
                    displayOrder: null,
                    active: true,
                    cacheLoaderName: null
                }
            ]
        }
    })
    afterAll(() => {
        loginByRoleRequestMock.mockRestore()
        consoleMock.mockRestore()
        historyObjMock.mockRestore()
    })
    it('should skip login without role', () => {
        const action = $do.login({ login: 'sss', password: 'sss' })
        const epic = loginByAnotherRoleEpic(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(result.length).toBe(0)
        })
    })
    it('should login without role switching', () => {
        const role = store.getState().session.activeRole
        const action = $do.login({ login: null, password: null, role })
        const epic = loginByAnotherRoleEpic(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(historyObjMock).toHaveBeenCalledTimes(0)
            expect(result.length).toBe(1)
            expect(result[0].payload.activeRole).toBe(role)
            expect(loginByRoleRequestMock).toHaveBeenCalledWith(role)
        })
    })
    it('should login with role switching', () => {
        const role = store.getState().session.roles[0].key
        const action = $do.login({ login: null, password: null, role })
        const epic = loginByAnotherRoleEpic(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(historyObjMock).toHaveBeenCalled()
            expect(result.length).toBe(1)
            expect(result[0].payload.activeRole).toBe(role)
            expect(loginByRoleRequestMock).toHaveBeenCalledWith(role)
        })
    })
    it('should login with role switching (branch with default screen)', () => {
        const role = store.getState().session.roles[1].key
        const action = $do.login({ login: null, password: null, role })
        const epic = loginByAnotherRoleEpic(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(historyObjMock).toHaveBeenCalled()
            expect(result.length).toBe(1)
            expect(result[0].payload.activeRole).toBe(role)
            expect(loginByRoleRequestMock).toHaveBeenCalledWith(role)
        })
    })
    it('should handle error', () => {
        const action = $do.login({ login: null, password: null, role: 'error' })
        const epic = loginByAnotherRoleEpic(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(consoleMock).toHaveBeenCalled()
            expect(result.length).toBe(1)
            expect(result[0]).toEqual(expect.objectContaining($do.loginFail({ errorMsg: 'Empty server response' })))
        })
    })
})
