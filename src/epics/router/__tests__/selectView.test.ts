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
import { changeView } from '../selectView'

describe('selectView', () => {
    let store: Store<CoreStore> = null
    const action = $do.selectView(null)

    beforeAll(() => {
        store = mockStore()
        // store.getState().view.name = 'view-previous'
        store.getState().router.bcPath = 'bcParent/4/bcChild/5'
        store.getState().screen.bo.bc = {
            bcParent: { cursor: '1', name: 'bcParent', parentName: null, url: 'bcParent/:id' },
            bcChild: { cursor: '2', name: 'bcChild', parentName: 'bcParent', url: 'bcParent/:id/bcChild/:id' }
        }
    })

    it('fires `bcChangeCursors` if route cursors does not match the store', () => {
        store.getState().router.bcPath = 'bcParent/4/bcChild/5/bcNew/8'
        const epic = changeView(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(
                expect.objectContaining(
                    $do.bcChangeCursors({
                        cursorsMap: {
                            bcParent: '4',
                            bcChild: '5',
                            bcNew: '8'
                        }
                    })
                )
            )
        })
    })

    it('fires nothing if route cursors match the store', () => {
        store.getState().router.bcPath = 'bcParent/1/bcChild/2'
        const epic = changeView(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(res.length).toBe(0)
        })
    })

    it('fires nothing if no cursors in route', () => {
        store.getState().router.bcPath = null
        const epic = changeView(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(res.length).toBe(0)
        })
    })
})
