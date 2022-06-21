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
import { loginDone } from '../loginDone'
import { RouteType } from '../../../interfaces/router'
import { SessionScreen } from '../../../interfaces/session'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'
import { of as observableOf } from 'rxjs'

describe('loginDone', () => {
    let store$: StateObservable<CoreStore> = null
    const action = $do.loginDone(null)

    beforeAll(() => {
        store$ = createMockStateObservable()
        store$.value.router.screenName = 'screen-example'
        store$.value.session.screens = [requestedScreen, defaultScreen]
    })

    afterEach(() => {
        store$.value.router.type = RouteType.screen
    })

    it('fires `handleRouter` for server-side routing', () => {
        store$.value.router.type = RouteType.router
        const epic = loginDone(observableOf(action), store$)
        testEpic(epic, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.handleRouter(store$.value.router)))
        })
    })

    it('fires `selectScreen` or `selectScreenFail`', () => {
        const epicRequested = loginDone(observableOf(action), store$)
        testEpic(epicRequested, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectScreen({ screen: requestedScreen })))
        })
        store$.value.router.screenName = null
        const epicDefault = loginDone(observableOf(action), store$)
        testEpic(epicDefault, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectScreen({ screen: defaultScreen })))
        })
        store$.value.router.screenName = 'screen-missing'
        store$.value.session.screens = [requestedScreen]
        const epicFirstAvailable = loginDone(observableOf(action), store$)
        testEpic(epicFirstAvailable, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectScreen({ screen: requestedScreen })))
        })
        store$.value.session.screens = []
        const epicFail = loginDone(observableOf(action), store$)
        testEpic(epicFail, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectScreenFail({ screenName: 'screen-missing' })))
        })
    })
})

const requestedScreen: SessionScreen = {
    id: null,
    name: 'screen-example',
    text: 'Next Screen',
    url: 'screen/screen-example'
}

const defaultScreen: SessionScreen = {
    id: null,
    name: 'screen-default',
    text: 'Default Screen',
    url: 'screen/screen-default',
    defaultScreen: true
}
