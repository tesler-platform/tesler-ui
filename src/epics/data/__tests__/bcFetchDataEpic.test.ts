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
import { dataEpics } from '../../data'
import { $do } from '../../../actions/actions'
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
    return Observable.empty<never>()
})

const consoleMock = jest.fn()

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
        store.getState().screen.screenName = 'test'
    })

    it('bcForceUpdate call api request', () => {
        store.getState().view.widgets[0] = { ...getWidgetMeta() }
        const action = $do.bcForceUpdate({
            bcName: 'bcExample',
            widgetName: 'widget-example'
        })
        const epic = dataEpics.bcFetchDataEpic(ActionsObservable.of(action), store)
        testEpic(epic, () => {
            expect(customActionMock).toBeCalledWith('test', 'bcExample', { _limit: 5, _page: 2 }, canceler.cancelToken)
        })
    })

    it('bcForceUpdate (with widgetName param) call data from first page for infiniteWidgets widgets', () => {
        store.getState().view.widgets[0] = { ...getWidgetMeta() }
        store.getState().view.infiniteWidgets[0] = 'widget-example'
        const action = $do.bcForceUpdate({
            bcName: 'bcExample',
            widgetName: 'widget-example'
        })
        const epic = dataEpics.bcFetchDataEpic(ActionsObservable.of(action), store)
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
        const epic = dataEpics.bcFetchDataEpic(ActionsObservable.of(action), store)
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
        const epic = dataEpics.bcFetchDataEpic(ActionsObservable.of(action), store)
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
        const epic = dataEpics.bcFetchDataEpic(ActionsObservable.of(action), store)
        testEpic(epic, () => {
            expect(customActionMock).toBeCalledWith('test', 'bcExample', { _limit: 20, _page: 1 }, canceler.cancelToken)
        })
    })
})

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
