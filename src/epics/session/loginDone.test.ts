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
import { Store as CoreStore } from '../../interfaces/store'
import { mockStore } from '../../tests/mockStore'
import { loginEpic } from './loginDone'
import { $do } from '../../actions/actions'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../tests/testEpic'

describe('`loginDone` epic', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })

    it('does nothing', () => {
        const action = $do.login({ login: 'bruce', password: 'qwerty' })
        const epic = loginEpic(ActionsObservable.of(action), store)

        testEpic(epic, result => {
            expect(result.length).toBe(0)
        })
    })
})
