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
import { changeLocation } from '../changeLocation'
import { RouteType } from '../../../interfaces/router'
import { SessionScreen } from '../../../interfaces/session'
import { ViewMetaResponse } from '../../../interfaces/view'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'

describe('selectScreenFail', () => {
    let store$: StateObservable<CoreStore> = null
    const action = $do.changeLocation(null)

    beforeAll(() => {
        store$ = createMockStateObservable()
        const state = store$.value
        state.session.active = true
        // existing route details
        state.screen.screenName = 'screen-previous'
        state.screen.views = [requestedView, defaultView]
        state.view.name = 'view-previous'
        state.screen.bo.bc = {
            bcParent: { cursor: '1', name: 'bcParent', parentName: null, url: 'bcParent/:id' },
            bcChild: { cursor: '2', name: 'bcChild', parentName: 'bcParent', url: 'bcParent/:id/bcChild/:id' }
        }
        // requested route details
        state.session.screens = [requestedScreen, defaultScreen]
        state.router.type = RouteType.screen
        state.data.bcParent = [{ id: '1', vstamp: 0 }]
        state.data.bcChild = [{ id: '2', vstamp: 0 }]
    })

    afterEach(() => {
        store$.value.router = { type: RouteType.screen, path: '/', params: null, screenName: null }
        store$.value.screen.screenName = 'screen-previous'
        store$.value.session.screens = [requestedScreen, defaultScreen]
        store$.value.screen.views = [requestedView, defaultView]
    })

    it('returns empty when user is not logged in', () => {
        store$.value.session.active = false
        const epic = changeLocation(ActionsObservable.of(action), store$)
        testEpic(epic, res => {
            expect(res.length).toBe(0)
        })
        store$.value.session.active = true
    })

    it('fires `handleRouter` action for server-side routing', () => {
        store$.value.router.type = RouteType.router
        const epic = changeLocation(ActionsObservable.of(action), store$)
        testEpic(epic, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.handleRouter(store$.value.router)))
        })
    })

    it('fires `selectScreen`/`selectScreenFail` if current screen does not match the store', () => {
        expect(store$.value.router.screenName !== 'screen-next').toBe(true)
        store$.value.router.screenName = 'screen-next'
        const epic = changeLocation(ActionsObservable.of(action), store$)
        testEpic(epic, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectScreen({ screen: requestedScreen })))
        })
        store$.value.router.screenName = 'screen-missing'
        const epicFail = changeLocation(ActionsObservable.of(action), store$)
        testEpic(epicFail, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectScreenFail({ screenName: 'screen-missing' })))
        })
    })

    it('fires `selectView`/`selectViewFail` if current view does not match the store', () => {
        store$.value.screen.screenName = 'screen-next'
        store$.value.router.screenName = 'screen-next'
        expect(store$.value.view.name !== 'view-next').toBe(true)
        store$.value.router.viewName = 'view-next'
        const epic = changeLocation(ActionsObservable.of(action), store$)
        testEpic(epic, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectView(requestedView)))
        })
        store$.value.router.viewName = 'view-missing'
        const epicFailView = changeLocation(ActionsObservable.of(action), store$)
        testEpic(epicFailView, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectViewFail({ viewName: 'view-missing' })))
        })
    })

    it('fires `bcChangeCursors` if route cursors does not match the store', () => {
        store$.value.screen.screenName = 'screen-next'
        store$.value.router.screenName = 'screen-next'
        store$.value.router.bcPath = 'bcParent/4/bcChild/5'
        expect(store$.value.view.name !== 'view-next').toBe(true)
        store$.value.router.viewName = 'view-next'
        const epic = changeLocation(ActionsObservable.of(action), store$)
        testEpic(epic, res => {
            expect(res.length).toBe(2)
            expect(res[0]).toEqual(
                expect.objectContaining(
                    $do.bcChangeCursors({
                        cursorsMap: {
                            bcParent: '4',
                            bcChild: '5'
                        }
                    })
                )
            )
            expect(res[1]).toEqual(expect.objectContaining($do.selectView(requestedView)))
        })
    })

    it('fires `bcForceUpdate` if route updates cursors on the same view', () => {
        store$.value.screen.screenName = 'screen-next'
        store$.value.view.name = 'view-next'
        store$.value.router.screenName = 'screen-next'
        store$.value.router.bcPath = 'bcParent/4/bcChild/5'
        store$.value.router.viewName = 'view-next'
        const epic = changeLocation(ActionsObservable.of(action), store$)
        testEpic(epic, res => {
            expect(res.length).toBe(3)
            expect(res[0]).toEqual(
                expect.objectContaining(
                    $do.bcChangeCursors({
                        cursorsMap: {
                            bcParent: '4',
                            bcChild: '5'
                        }
                    })
                )
            )
            expect(res[1]).toEqual(expect.objectContaining($do.bcForceUpdate({ bcName: 'bcParent' })))
            expect(res[2]).toEqual(expect.objectContaining($do.bcForceUpdate({ bcName: 'bcChild' })))
        })
    })

    it('uses default screens for `default` route type', () => {
        store$.value.router.type = RouteType.default
        expect(store$.value.router.screenName).toBeFalsy()
        const explicitDefaultScreen = changeLocation(ActionsObservable.of(action), store$)
        testEpic(explicitDefaultScreen, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectScreen({ screen: defaultScreen })))
        })
        store$.value.session.screens = [requestedScreen]
        const firstAvailableScreen = changeLocation(ActionsObservable.of(action), store$)
        testEpic(firstAvailableScreen, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectScreen({ screen: requestedScreen })))
        })
        store$.value.session.screens = []
        const noScreens = changeLocation(ActionsObservable.of(action), store$)
        testEpic(noScreens, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectScreenFail({ screenName: undefined })))
        })
    })

    it('uses primary view when there is no view in route', () => {
        // default views
        store$.value.screen.screenName = 'screen-next'
        store$.value.router.screenName = 'screen-next'
        expect(store$.value.router.viewName).toBeFalsy()
        store$.value.screen.primaryView = 'view-default'
        const explicitDefaultView = changeLocation(ActionsObservable.of(action), store$)
        testEpic(explicitDefaultView, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectView(defaultView)))
        })
        store$.value.screen.primaryView = null
        const firstAvailableView = changeLocation(ActionsObservable.of(action), store$)
        testEpic(firstAvailableView, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectView(requestedView)))
        })
        store$.value.screen.views = []
        const noViews = changeLocation(ActionsObservable.of(action), store$)
        testEpic(noViews, res => {
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectViewFail({ viewName: undefined })))
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

const requestedScreen: SessionScreen = {
    id: null,
    primary: 'view-default',
    name: 'screen-next',
    text: 'Next Screen',
    url: 'screen/screen-next'
}

const defaultScreen: SessionScreen = {
    id: null,
    primary: 'view-default',
    name: 'screen-default',
    text: 'Default Screen',
    url: 'screen/screen-default',
    defaultScreen: true
}
