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

import {Store} from 'redux'
import {Store as CoreStore} from '../../../interfaces/store'
import {mockStore} from '../../../tests/mockStore'
import {bcFetchRowMetaRequest} from '../bcFetchRowMetaRequest'
import {customAction} from '../../../api/api'
import * as api from '../../../api/api'
import {Observable} from 'rxjs'
import {$do} from '../../../actions/actions'
import {ActionsObservable} from 'redux-observable'
import {WidgetTableMeta, WidgetTypes} from '../../../interfaces/widget'
import {FieldType} from '../../../interfaces/view'
import {testEpic} from '../../../tests/testEpic'
import {RowMeta} from '../../../interfaces/rowMeta'

const customActionMock = jest.fn().mockImplementation((...args: Parameters<typeof customAction>) => {
    const [screenName] = args
    if (screenName === 'crash') {
        throw Error('test request crash')
    }
    return Observable.of({
        row: rowMeta,
        preInvoke: null
    })
})

const consoleMock = jest.fn()

jest.spyOn<any, any>(api, 'fetchRowMeta').mockImplementation(customActionMock)
jest.spyOn(console, 'error').mockImplementation(consoleMock)

describe('bcFetchRowMetaRequest', () => {
    let store: Store<CoreStore> = null
    const canceler = api.createCanceler()

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.screenName = 'test'
        store.getState().screen.bo.bc.bcExample = bcExample
    })

    afterEach(() => {
        jest.clearAllMocks()
        store.getState().screen.screenName = 'test'
    })

    it('sends API request, fires `bcFetchRowMetaSuccess` on success', () => {
        store.getState().view.widgets[0] = { ...getWidgetMeta() }
        const action = $do.bcFetchRowMeta({
            bcName: 'bcExample',
            widgetName: 'widget-example'
        })
        const epic = bcFetchRowMetaRequest(ActionsObservable.of(action), store)
        testEpic(epic, (result) => {
            expect(customActionMock).toBeCalledWith('test', 'bcExample/1', undefined, canceler.cancelToken)
            /* expect(result[0]).toEqual(expect.objectContaining($do.bcFetchRowMetaSuccess({
                bcName: 'bcExample',
                bcUrl: 'bcExample/1',
                rowMeta
            })))
            */
        })
    })

    it.skip('fires `bcFetchRowMetaFail` and writes console error on error', () => {
        /* TODO */
    })

    it.skip('cancels request and fires `bcFetchRowMetaFail` when parent BC fired `bcSelectRecord`', () => {
        /* TODO */
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
        fields: [{
            key: 'name',
            title: 'Test Column',
            type: FieldType.input
        }],
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
    fields: [{
        key: 'id',
        currentValue: '19248'
    }]
}
