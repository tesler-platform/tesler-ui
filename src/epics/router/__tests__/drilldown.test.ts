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
import { drillDown } from '../drilldown'
import { DrillDownType } from '../../../interfaces/router'

const windowOpenMock = jest.fn()
jest.spyOn(window, 'open').mockImplementation(url => windowOpenMock(url))

describe('drilldown', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        const location = window.location
        delete global.window.location
        global.window.location = Object.assign({}, location)
    })

    beforeEach(() => {
        windowOpenMock.mockClear()
        window.location.href = 'http://localhost'
    })

    it('sets `window.location.url` for `external` drilldowns', () => {
        const action = $do.drillDown({
            url: 'https://github.com/tesler-platform/tesler-ui',
            drillDownType: DrillDownType.external
        })
        const epic = drillDown(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(res.length).toBe(0)
            expect(window.location.href).toBe('https://github.com/tesler-platform/tesler-ui')
            expect(windowOpenMock).toBeCalledTimes(0)
        })
    })

    it('calls `window.open()` for `externalNew` drilldowns', () => {
        const action = $do.drillDown({
            url: 'https://github.com/tesler-platform/tesler-ui',
            drillDownType: DrillDownType.externalNew
        })
        const epic = drillDown(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(res.length).toBe(0)
            expect(windowOpenMock).toBeCalledWith('https://github.com/tesler-platform/tesler-ui')
        })
    })
    it('sets `window.location.url` with relative url for `relative` drilldowns', () => {
        const action = $do.drillDown({
            url: 'screen/example/view/example',
            drillDownType: DrillDownType.relative
        })
        const epic = drillDown(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(res.length).toBe(0)
            expect(window.location.href).toBe('http://localhost/screen/example/view/example')
            expect(windowOpenMock).toBeCalledTimes(0)
        })
    })

    it('calls `window.open()` with relative url for `relativeNew` drilldowns', () => {
        const action = $do.drillDown({
            url: 'screen/example/view/example',
            drillDownType: DrillDownType.relativeNew
        })
        const epic = drillDown(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(res.length).toBe(0)
            expect(windowOpenMock).toBeCalledWith('http://localhost/screen/example/view/example')
        })
    })

    it.skip('returns empty observable for unspecified drilldown type', () => {
        const action = $do.drillDown({
            url: 'screen/example/view/example'
        })
        const epic = drillDown(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(res.length).toBe(0)
            expect(window.location.href).toBe('http://localhost')
            expect(windowOpenMock).toBeCalledTimes(0)
        })
    })
})

describe('inner drilldown', () => {
    /* TODO */
})
