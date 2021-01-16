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

import { testEpic } from '../../../tests/testEpic'
import { $do } from '../../../actions/actions'
import { ActionsObservable } from 'redux-observable'
import { mockStore } from '../../../tests/mockStore'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { handleRouter } from '../handleRouter'
import { Observable } from 'rxjs'
import * as api from '../../../api/api'

const errorMock = jest.fn()
const routerMock = jest.fn().mockImplementation((path, params) => {
    if (path === '/error') {
        return Observable.throw('404 NOT FOUND')
    }
    return Observable.of('200 OK')
})

jest.spyOn(console, 'error').mockImplementation(errorMock)
jest.spyOn(api, 'routerRequest').mockImplementation(routerMock)

describe('selectScreenFail', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })

    it('Sends a requst to Tesler API router endpoint', () => {
        const action = $do.handleRouter({ path: '/data', params: { someParam: 3 } })
        const epic = handleRouter(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(res.length).toBe(0)
            expect(routerMock).toBeCalledWith('/data', expect.objectContaining({ someParam: 3 }))
        })
    })

    it('Writes a console error if request fails.', () => {
        const action = $do.handleRouter({ path: '/error', params: { someParam: 3 } })
        const epic = handleRouter(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(res.length).toBe(0)
            expect(routerMock).toBeCalledWith('/error', expect.objectContaining({ someParam: 3 }))
            expect(errorMock).toBeCalledWith('404 NOT FOUND')
        })
    })
})
