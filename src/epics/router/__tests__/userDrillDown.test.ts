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

import { of as observableOf, throwError as observableThrowError } from 'rxjs'
import { testEpic } from '../../../tests/testEpic'
import { $do } from '../../../actions/actions'
import { StateObservable } from 'redux-observable'
import { mockStore } from '../../../tests/mockStore'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { userDrillDown } from '../userDrillDown'
import { WidgetTableMeta } from '../../../interfaces/widget'
import { FieldType } from '../../../interfaces/view'
import * as api from '../../../api/api'
import { RowMeta } from '../../../interfaces/rowMeta'
import { DrillDownType } from '../../../interfaces/router'
import { createStateObservable } from '../../../tests/createStateObservable'

describe('userDrillDown', () => {
    const errorMock = jest.fn()
    const fetchRowMeta = jest.fn().mockImplementation((screenName, bcUrl) => {
        if (screenName === 'screen-error') {
            return observableThrowError(() => '404 NOT FOUND')
        }
        if (screenName === 'screen-inner') {
            return observableOf({ rowMeta, fields: rowMeta.fields.map(field => ({ ...field, drillDownType: DrillDownType.inner })) })
        }
        if (screenName === 'screen-missing') {
            return observableOf({ rowMeta, fields: rowMeta.fields.map(field => ({ ...field, drillDown: null })) })
        }
        return observableOf(rowMeta)
    })

    jest.spyOn(console, 'error').mockImplementation(errorMock)
    jest.spyOn(api, 'fetchRowMeta').mockImplementation(fetchRowMeta)

    let store: Store<CoreStore> = null
    let store$: StateObservable<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store$ = createStateObservable(store.getState())
        store$.value.screen.screenName = 'screen-example'
        store$.value.screen.bo.bc = { bcExample }
        store$.value.view.widgets = [getWidgetMeta()]
    })

    afterEach(() => {
        store$.value.data = {}
        store$.value.screen.screenName = 'screen-example'
        errorMock.mockClear()
        fetchRowMeta.mockClear()
    })

    it('fires `bcChangeCursors` if cursor from action payload is different from BC cursor in the store', () => {
        const action = $do.userDrillDown({ ...payload, cursor: '5', fieldKey: 'missing' })
        const mockDispatch = jest.fn()
        const epic = userDrillDown(observableOf(action), store$, { store: { ...store, dispatch: mockDispatch } })
        testEpic(epic, res => {
            expect(res.length).toBe(0)
            expect(mockDispatch).toBeCalledWith(
                expect.objectContaining(
                    $do.bcChangeCursors({
                        cursorsMap: { bcExample: '5' }
                    })
                )
            )
        })
    })

    it('handles missing widget', () => {
        const action = $do.userDrillDown({ ...payload, widgetName: 'missing', cursor: '5' })
        const mockDispatch = jest.fn()
        const epic = userDrillDown(observableOf(action), store$, { store: { ...store, dispatch: mockDispatch } })
        testEpic(epic, res => {
            expect(errorMock).toBeCalledTimes(0)
        })
    })

    it('sends fetch row meta request', () => {
        const action = $do.userDrillDown(payload)
        const epic = userDrillDown(observableOf(action), store$, { store })
        testEpic(epic, res => {
            expect(fetchRowMeta).toBeCalledWith('screen-example', 'bcExample/1')
        })
    })

    it('writes console error if fetch row meta request failed', () => {
        store$.value.screen.screenName = 'screen-error'
        const action = $do.userDrillDown(payload)
        const epic = userDrillDown(observableOf(action), store$, { store })
        testEpic(epic, res => {
            expect(fetchRowMeta).toBeCalledWith('screen-error', 'bcExample/1')
            expect(errorMock).toBeCalledWith('404 NOT FOUND')
        })
    })

    /**
     * It seems that behavior is wrong here; matching route condition will probably never be hit
     *
     * TODO: Review this case and either make condition strict or remove it completely
     */
    it('returns empty observable if drilldown is not needed', () => {
        store$.value.router.path = null
        store$.value.screen.screenName = 'screen-missing'
        const action = $do.userDrillDown(payload)
        const epic = userDrillDown(observableOf(action), store$, { store })
        testEpic(epic, res => {
            expect(fetchRowMeta).toBeCalledWith('screen-missing', 'bcExample/1')
            expect(errorMock).toBeCalledTimes(0)
            expect(res.length).toBe(0)
        })
    })

    it('fires `bcFetchRowMetaSuccess` (for not inner drilldowns), `userDrillDownSuccess` and `drillDown` on success', () => {
        store$.value.router.path = '/screen-example'
        const action = $do.userDrillDown(payload)
        const epic = userDrillDown(observableOf(action), store$, { store })
        testEpic(epic, res => {
            expect(res.length).toBe(3)
            expect(res[0]).toEqual(
                expect.objectContaining(
                    $do.bcFetchRowMetaSuccess({
                        bcName: 'bcExample',
                        rowMeta,
                        bcUrl: 'bcExample/1',
                        cursor: '1'
                    })
                )
            )
            expect(res[1]).toEqual(
                expect.objectContaining(
                    $do.userDrillDownSuccess({
                        bcName: 'bcExample',
                        bcUrl: 'bcExample/1',
                        cursor: '1'
                    })
                )
            )
            expect(res[2]).toEqual(
                expect.objectContaining(
                    $do.drillDown({
                        url: '/screen-new',
                        drillDownType: DrillDownType.relative,
                        route: store$.value.router
                    })
                )
            )
        })
    })

    it('does not fire `bcFetchRowMetaSuccess` for inner drilldowns', () => {
        store$.value.router.path = '/screen-inner'
        store$.value.screen.screenName = 'screen-inner'
        const action = $do.userDrillDown(payload)
        const epic = userDrillDown(observableOf(action), store$, { store })
        testEpic(epic, res => {
            expect(res.length).toBe(2)
            expect(res[0]).toEqual(
                expect.objectContaining(
                    $do.userDrillDownSuccess({
                        bcName: 'bcExample',
                        bcUrl: 'bcExample/1',
                        cursor: '1'
                    })
                )
            )
            expect(res[1]).toEqual(
                expect.objectContaining(
                    $do.drillDown({
                        url: '/screen-new',
                        drillDownType: DrillDownType.inner,
                        route: store$.value.router
                    })
                )
            )
        })
    })

    it('uses custom drilldown url from the record if available', () => {
        store$.value.data.bcExample = [{ id: '1', vstamp: 0, eee: '/custom-url' }]
        store$.value.router.path = '/screen-inner'
        store$.value.screen.screenName = 'screen-inner'
        const action = $do.userDrillDown(payload)
        const epic = userDrillDown(observableOf(action), store$, { store })
        testEpic(epic, res => {
            expect(res[1]).toEqual(
                expect.objectContaining(
                    $do.drillDown({
                        url: '/custom-url',
                        drillDownType: DrillDownType.inner,
                        route: store$.value.router
                    })
                )
            )
        })
    })
})

function getWidgetMeta(): WidgetTableMeta {
    return {
        name: 'widget-example',
        type: null,
        title: null,
        bcName: 'bcExample',
        position: 1,
        gridWidth: null,
        fields: [
            {
                key: 'name',
                title: 'Test Column',
                type: FieldType.input,
                drillDownKey: 'eee'
            }
        ]
    }
}

const bcExample = {
    name: 'bcExample',
    parentName: null as string,
    url: 'bcExample/:id',
    cursor: '1',
    page: 2,
    limit: 5,
    loading: false
}

const rowMeta: RowMeta = {
    actions: [],
    fields: [
        {
            key: 'name',
            currentValue: '19248',
            drillDown: '/screen-new',
            drillDownType: DrillDownType.relative
        }
    ]
}

const payload = { widgetName: 'widget-example', bcName: 'bcExample', cursor: '1', fieldKey: 'name' }
