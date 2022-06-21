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

import { $do } from '../../../actions/actions'
import { Store as CoreStore } from '../../../interfaces/store'
import { StateObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import { httpError401 } from '../httpError401'
import { Store } from 'redux'
import { mockStore } from '../../../tests/mockStore'
import { createStateObservable } from '../../../tests/createStateObservable'
import { of as observableOf, timer } from 'rxjs'
import { tap } from 'rxjs/operators'

const pushMock = jest.fn().mockImplementation()
const dispatchMock = jest.fn()
jest.mock('history', () => ({
    createHashHistory: () => ({
        push: (arg: any) => {
            pushMock(arg)
        }
    })
}))

describe('httpError401', () => {
    let store: Store<CoreStore> = null
    let store$: StateObservable<CoreStore> = null

    beforeAll(() => {
        /**
         * TODO
         *
         * The timer is needed because when mockStore is called,
         * reducers.router will be equal to undefined and
         * the test will fail
         */
        timer(500).pipe(
            tap(() => {
                store = mockStore()
                store$ = createStateObservable(store.getState())
            })
        )
    })

    it('dispatch `logoutDone` and redirects to `/`', () => {
        const action = $do.httpError({
            statusCode: 401,
            error: {
                config: null,
                isAxiosError: true,
                name: 'test',
                message: 'test'
            },
            callContext: { widgetName: 'widget-example' }
        })
        const epic = httpError401(observableOf(action), store$, { store: { ...store, dispatch: dispatchMock } })
        testEpic(epic, () => {
            expect(dispatchMock).toBeCalledWith(expect.objectContaining($do.logoutDone(null)))
            expect(pushMock).toBeCalledWith('/')
        })
    })
})
