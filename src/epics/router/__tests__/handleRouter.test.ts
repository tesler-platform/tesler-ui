import { of as observableOf, throwError as observableThrowError } from 'rxjs'
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
import { ActionsObservable, StateObservable } from 'redux-observable'
import { Store as CoreStore } from '../../../interfaces/store'
import { handleRouter } from '../handleRouter'
import * as api from '../../../api/api'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'

const errorMock = jest.fn()
const routerMock = jest.fn().mockImplementation((path, params) => {
    if (path === '/error') {
        return observableThrowError('404 NOT FOUND')
    }
    return observableOf('200 OK')
})

jest.spyOn(console, 'error').mockImplementation(errorMock)
jest.spyOn(api, 'routerRequest').mockImplementation(routerMock)

describe('selectScreenFail', () => {
    let store$: StateObservable<CoreStore> = null

    beforeAll(() => {
        store$ = createMockStateObservable()
    })

    it('Sends a requst to Tesler API router endpoint', () => {
        const action = $do.handleRouter({ path: '/data', params: { someParam: 3 } })
        const epic = handleRouter(ActionsObservable.of(action), store$)
        testEpic(epic, res => {
            expect(res.length).toBe(0)
            expect(routerMock).toBeCalledWith('/data', expect.objectContaining({ someParam: 3 }))
        })
    })

    it('Writes a console error if request fails.', () => {
        const action = $do.handleRouter({ path: '/error', params: { someParam: 3 } })
        const epic = handleRouter(ActionsObservable.of(action), store$)
        testEpic(epic, res => {
            expect(res.length).toBe(0)
            expect(routerMock).toBeCalledWith('/error', expect.objectContaining({ someParam: 3 }))
            expect(errorMock).toBeCalledWith('404 NOT FOUND')
        })
    })
})
