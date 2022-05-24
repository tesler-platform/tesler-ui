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

import { of as observableOf, throwError as observableThrowError } from 'rxjs'
import { bcNewDataEpic } from '../bcNewDataEpic'
import { $do } from '../../../actions/actions'
import { Store as CoreStore } from '../../../interfaces/store'
import * as api from '../../../api/api'
import { newBcData } from '../../../api/api'
import { ActionsObservable, StateObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import { OperationTypeCrud, OperationPostInvokeRefreshBc, OperationPostInvokeType } from '../../../interfaces/operation'
import { RowMeta } from '../../../interfaces/rowMeta'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'

const newBcDataApiMock = jest.fn().mockImplementation((...args: Parameters<typeof newBcData>) => {
    const [screenName] = args
    if (screenName === 'crash') {
        return observableThrowError('test request crash')
    }
    return observableOf({
        row: rowMeta,
        postActions: screenName === 'withPostInvoke' ? [postInvoke] : [],
        preInvoke: null
    })
})

const consoleMock = jest.fn()

jest.spyOn<any, any>(api, 'newBcData').mockImplementation(newBcDataApiMock)
jest.spyOn(console, 'error').mockImplementation(consoleMock)

describe('`bcNewDataEpic`', () => {
    let store$: StateObservable<CoreStore> = null

    const action = $do.sendOperation({
        bcName: 'bcExample',
        widgetName: 'widget-example',
        operationType: OperationTypeCrud.create
    })

    beforeAll(() => {
        store$ = createMockStateObservable()
        store$.value.screen.screenName = 'test'
        store$.value.screen.bo.bc.bcExample = bcExample
    })

    afterEach(() => {
        jest.clearAllMocks()
        store$.value.screen.screenName = 'test'
    })

    it('sends `row-meta-new` request', () => {
        const epic = bcNewDataEpic(ActionsObservable.of(action), store$)
        testEpic(epic, () => {
            expect(newBcDataApiMock).toBeCalledWith(
                'test',
                'bcExample',
                { widgetName: 'widget-example' },
                { _action: OperationTypeCrud.create }
            )
        })
    })

    it('puts new record in the store and sets BC cursor', () => {
        const epic = bcNewDataEpic(ActionsObservable.of(action), store$)
        testEpic(epic, result => {
            expect(result.length).toBe(3)
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.bcNewDataSuccess({
                        bcName: 'bcExample',
                        dataItem: { id: '19248', vstamp: -1 },
                        bcUrl: 'bcExample'
                    })
                )
            )
            expect(result[1]).toEqual(
                expect.objectContaining(
                    $do.bcFetchRowMetaSuccess({
                        bcName: 'bcExample',
                        bcUrl: 'bcExample/19248',
                        rowMeta,
                        cursor: '19248'
                    })
                )
            )
            expect(result[2]).toEqual(
                expect.objectContaining(
                    $do.changeDataItem({
                        bcName: 'bcExample',
                        cursor: '19248',
                        dataItem: {
                            id: '19248'
                        }
                    })
                )
            )
        })
    })

    it('process post invoke', () => {
        store$.value.screen.screenName = 'withPostInvoke'
        const epic = bcNewDataEpic(ActionsObservable.of(action), store$)
        testEpic(epic, result => {
            expect(result.length).toBe(4)
            expect(result[3]).toEqual(
                expect.objectContaining(
                    $do.processPostInvoke({
                        bcName: 'bcExample',
                        postInvoke,
                        cursor: '19248',
                        widgetName: 'widget-example'
                    })
                )
            )
        })
    })

    it('dispatch `bcNewDataFail` and console error on crash', () => {
        store$.value.screen.screenName = 'crash'
        const brokenAction = $do.sendOperation({
            bcName: 'bcExample',
            widgetName: 'widget-example',
            operationType: OperationTypeCrud.create
        })
        const epic = bcNewDataEpic(ActionsObservable.of(brokenAction), store$)
        testEpic(epic, result => {
            expect(consoleMock).toBeCalledWith('test request crash')
            expect(result[0]).toEqual(expect.objectContaining($do.bcNewDataFail({ bcName: 'bcExample' })))
        })
    })
})

const bcExample = {
    name: 'bcExample',
    parentName: null as string,
    url: 'bcExample/:id',
    cursor: '1',
    loading: false
}

const postInvoke: OperationPostInvokeRefreshBc = {
    bc: 'bcExample',
    type: OperationPostInvokeType.refreshBC
}

const rowMeta: RowMeta = {
    actions: [],
    fields: [
        {
            key: 'id',
            currentValue: '19248'
        }
    ]
}
