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
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { WidgetTableMeta, WidgetTypes } from '../../../interfaces/widget'
import { FieldType } from '../../../interfaces/view'
import { bcFetchDataEpic, bcFetchDataImpl } from '../bcFetchData'
import { $do, Epic, types } from '../../../actions/actions'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import * as api from '../../../api/api'
import { customAction } from '../../../api/api'
import { Observable } from 'rxjs'

const customActionMock = jest.fn().mockImplementation((...args: Parameters<typeof customAction>) => {
    const [screenName] = args
    if (screenName === 'crash') {
        throw Error('test request crash')
    }
    return Observable.of({ data: [{ id: '9', vstamp: 1 }], hasNext: true })
})

const consoleMock = jest.fn().mockImplementation(e => console.warn(e))

jest.spyOn<any, any>(api, 'fetchBcData').mockImplementation(customActionMock)
jest.spyOn(console, 'error').mockImplementation(consoleMock)

describe('bcFetchDataEpic', () => {
    let store: Store<CoreStore> = null
    const canceler = api.createCanceler()

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.screenName = 'test'
        store.getState().screen.bo.bc.bcExample = bcExample
        store.getState().view.widgets = [getWidgetMeta()]
    })

    afterEach(() => {
        store.getState().view.widgets = [getWidgetMeta()]
        store.getState().screen.bo.bc.bcChild = null
        store.getState().screen.bo.bc.bcLazyChild = null
        store.getState().screen.screenName = 'test'
    })

    it('bcForceUpdate calls api request', () => {
        store.getState().view.widgets[0] = { ...getWidgetMeta() }
        const action = $do.bcForceUpdate({
            bcName: 'bcExample',
            widgetName: 'widget-example'
        })
        const epic = bcFetchDataEpic(ActionsObservable.of(action), store)
        testEpic(epic, () => {
            expect(customActionMock).toBeCalledWith('test', 'bcExample', { _limit: 5, _page: 2 }, canceler.cancelToken)
        })
    })

    it('bcForceUpdate (with widgetName param) calls data from first page for infiniteWidgets widgets', () => {
        store.getState().view.widgets[0] = { ...getWidgetMeta() }
        store.getState().view.infiniteWidgets[0] = 'widget-example'
        const action = $do.bcForceUpdate({
            bcName: 'bcExample',
            widgetName: 'widget-example'
        })
        const epic = bcFetchDataEpic(ActionsObservable.of(action), store)
        testEpic(epic, () => {
            expect(customActionMock).toBeCalledWith('test', 'bcExample', { _limit: 10, _page: 1 }, canceler.cancelToken)
        })
    })

    it('bcForceUpdate (without widgetName param) call data from first page for infiniteWidgets widgets', () => {
        store.getState().view.widgets[0] = { ...getWidgetMeta() }
        store.getState().view.infiniteWidgets[0] = 'widget-example'
        const action = $do.bcForceUpdate({
            bcName: 'bcExample'
        })
        const epic = bcFetchDataEpic(ActionsObservable.of(action), store)
        testEpic(epic, () => {
            expect(customActionMock).toBeCalledWith('test', 'bcExample', { _limit: 10, _page: 1 }, canceler.cancelToken)
        })
    })

    it('bcFetchDataPages call data of custom page range', () => {
        store.getState().view.widgets[0] = { ...getWidgetMeta() }
        const action = $do.bcFetchDataPages({
            bcName: 'bcExample',
            widgetName: 'widget-example',
            from: 1,
            to: 5
        })
        const epic = bcFetchDataEpic(ActionsObservable.of(action), store)
        testEpic(epic, () => {
            expect(customActionMock).toBeCalledWith('test', 'bcExample', { _limit: 25, _page: 1 }, canceler.cancelToken)
        })
    })

    it('bcFetchDataPages call data to current page', () => {
        store.getState().view.widgets[0] = { ...getWidgetMeta() }
        store.getState().screen.bo.bc[bcExample.name].page = 5
        const action = $do.bcFetchDataPages({
            bcName: 'bcExample',
            widgetName: 'widget-example'
        })
        const epic = bcFetchDataEpic(ActionsObservable.of(action), store)
        testEpic(epic, e => {
            expect(customActionMock).toBeCalledWith('test', 'bcExample', { _limit: 20, _page: 1 }, canceler.cancelToken)
        })
    })

    it('returns empty for `showViewPopup` action if `bcName` and `calleeBCName` are the same', () => {
        const showViewPopupDiffers = $do.showViewPopup({
            bcName: 'bcExample',
            calleeBCName: 'bcExampleAnother',
            widgetName: 'widget-example'
        })
        testEpic(flow(ActionsObservable.of(showViewPopupDiffers), store), res => {
            expect(res[0]).toEqual(
                expect.objectContaining(
                    $do.bcChangeCursors({
                        keepDelta: undefined,
                        cursorsMap: {
                            bcExample: '9'
                        }
                    })
                )
            )
            expect(res[1]).toEqual(
                expect.objectContaining(
                    $do.bcFetchDataSuccess({
                        bcName: 'bcExample',
                        data: [{ id: '9', vstamp: 1 }],
                        bcUrl: 'bcExample',
                        depth: null,
                        hasNext: true
                    })
                )
            )
            expect(res[2]).toEqual(
                expect.objectContaining(
                    $do.bcFetchRowMeta({
                        widgetName: 'widget-example',
                        bcName: 'bcExample'
                    })
                )
            )
        })
        const showViewPopupSame = $do.showViewPopup({
            bcName: 'bcExample',
            calleeBCName: 'bcExample',
            widgetName: 'widget-example'
        })
        testEpic(flow(ActionsObservable.of(showViewPopupSame), store), res => {
            expect(res.length).toBe(0)
        })
    })

    it('does not fetch lazy widgets', () => {
        store.getState().screen.bo.bc.bcChild = bcChild
        store.getState().screen.bo.bc.bcLazyChild = bcLazyChild
        store.getState().view.widgets = [
            getWidgetMeta(),
            {
                ...getWidgetMeta(),
                bcName: 'bcLazyChild',
                name: 'lazy-widget',
                type: WidgetTypes.AssocListPopup
            },
            {
                ...getWidgetMeta(),
                bcName: 'bcChild',
                name: 'child-widget'
            }
        ]
        const action = $do.bcFetchDataRequest({ widgetName: 'widget-example', bcName: 'bcExample' })
        testEpic(flow(ActionsObservable.of(action), store), res => {
            expect(res.length).toBe(4)
            expect(res[0].type).toBe(types.bcChangeCursors)
            expect(res[1].type).toBe(types.bcFetchDataSuccess)
            expect(res[2].type).toBe(types.bcFetchRowMeta)
            expect(res[3]).toEqual(
                expect.objectContaining(
                    $do.bcFetchDataRequest({
                        bcName: 'bcChild',
                        widgetName: 'child-widget',
                        ignorePageLimit: false,
                        keepDelta: undefined
                    })
                )
            )
        })
    })
})

/** */
const flow: Epic = (action$, store) =>
    action$
        .ofType(types.bcFetchDataRequest, types.bcFetchDataPages, types.showViewPopup, types.bcForceUpdate, types.bcChangePage)
        .mergeMap(action => Observable.concat(...bcFetchDataImpl(action, store, ActionsObservable.of(action))))

function getWidgetMeta(): WidgetTableMeta {
    return {
        name: 'widget-example',
        type: WidgetTypes.List,
        title: null,
        bcName: 'bcExample',
        position: 1,
        gridWidth: null,
        fields: [
            {
                key: 'name',
                title: 'Test Column',
                type: FieldType.input
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

const bcChild = {
    ...bcExample,
    name: 'bcChild',
    parentName: 'bcExample',
    url: 'bcExample/:id/bcChild/:id'
}

const bcLazyChild = {
    ...bcExample,
    name: 'bcLazyChild',
    parentName: 'bcExample',
    url: 'bcExample/:id/bcLazyChild/:id'
}
