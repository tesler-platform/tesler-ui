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

import { bcSelectDepthRecord } from '../bcSelectDepthRecord'
import { $do } from '../../../actions/actions'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'

describe('bcSelectDepthRecord', () => {
    let store: Store<CoreStore> = null
    beforeAll(() => {
        store = mockStore()
    })
    it('fires `bcChangeDepthCursor` and `bcFetchDataRequest` actions', () => {
        const action = $do.bcSelectDepthRecord({
            bcName: 'bcExample',
            cursor: '17',
            depth: 2
        })
        const epic = bcSelectDepthRecord(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(result.length).toBe(2)
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.bcChangeDepthCursor({
                        bcName: 'bcExample',
                        cursor: '17',
                        depth: 2
                    })
                )
            )
            expect(result[1]).toEqual(
                expect.objectContaining(
                    $do.bcFetchDataRequest({
                        bcName: 'bcExample',
                        depth: 3,
                        widgetName: '',
                        ignorePageLimit: true
                    })
                )
            )
        })
    })
})
