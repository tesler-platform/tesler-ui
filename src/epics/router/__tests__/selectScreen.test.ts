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
import { StateObservable } from 'redux-observable'
import { Store as CoreStore } from '../../../interfaces/store'
import { changeScreen } from '../selectScreen'
import { ViewMetaResponse } from '../../../interfaces/view'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'
import { of as observableOf } from 'rxjs'

describe('selectScreen', () => {
    let store$: StateObservable<CoreStore> = null
    const action = $do.selectScreen(null)

    beforeAll(() => {
        store$ = createMockStateObservable()
        store$.value.screen.views = [requestedView, defaultView]
        store$.value.screen.primaryView = 'view-default'
    })

    afterEach(() => {
        store$.value.router.viewName = null
        store$.value.screen.views = [requestedView, defaultView]
    })

    it('select view specified by route when available', () => {
        store$.value.router.viewName = 'view-next'
        const epic = changeScreen(observableOf(action), store$)
        testEpic(epic, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectView(requestedView)))
        })
    })

    it('selects primary view or first available if route does not specify view', () => {
        const unspecifiedView = changeScreen(observableOf(action), store$)
        testEpic(unspecifiedView, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectView(defaultView)))
        })
        store$.value.screen.views = [requestedView]
        const firstAvailable = changeScreen(observableOf(action), store$)
        testEpic(firstAvailable, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectView(requestedView)))
        })
    })

    it('fires `selectViewFail` if no views present on the screen', () => {
        store$.value.router.viewName = 'view-next'
        store$.value.screen.views = []
        const epic = changeScreen(observableOf(action), store$)
        testEpic(epic, res => {
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
