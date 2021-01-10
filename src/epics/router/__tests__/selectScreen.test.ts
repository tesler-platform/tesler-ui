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

import {testEpic} from '../../../tests/testEpic'
import {$do} from '../../../actions/actions'
import {ActionsObservable} from 'redux-observable'
import {mockStore } from '../../../tests/mockStore'
import {Store} from 'redux'
import {Store as CoreStore} from '../../../interfaces/store'
import {changeScreen} from '../selectScreen'
import {ViewMetaResponse} from '../../../interfaces/view'

describe('selectScreen', () => {

    let store: Store<CoreStore> = null
    const action = $do.selectScreen(null)

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.views = [requestedView, defaultView]
        store.getState().screen.primaryView = 'view-default'
    })

    afterEach(() => {
        store.getState().router.viewName = null
        store.getState().screen.views = [requestedView, defaultView]
    })

    it('select view specified by route when available', () => {
        store.getState().router.viewName = 'view-next'
        const epic = changeScreen(ActionsObservable.of(action), store)
        testEpic(epic, (res) => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectView(requestedView)))
        })
    })

    it('selects primary view or first available if route does not specify view', () => {
        const unspecifiedView = changeScreen(ActionsObservable.of(action), store)
        testEpic(unspecifiedView, (res) => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectView(defaultView)))
        })
        store.getState().screen.views = [requestedView]
        const firstAvailable = changeScreen(ActionsObservable.of(action), store)
        testEpic(firstAvailable, (res) => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectView(requestedView)))
        })
    })

    it('fires `selectViewFail` if no views present on the screen', () => {
        store.getState().router.viewName = 'view-next'
        store.getState().screen.views = []
        const epic = changeScreen(ActionsObservable.of(action), store)
        testEpic(epic, (res) => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectViewFail({ viewName: 'view-next' })))
        })
    })
})


const requestedView: ViewMetaResponse = {
    name: 'view-next',
    url: 'screen/screen-next/view/view-next',
    widgets: []
}

const defaultView: ViewMetaResponse = {
    name: 'view-default',
    url: 'screen/screen-next/view/view-default',
    widgets: []
}
