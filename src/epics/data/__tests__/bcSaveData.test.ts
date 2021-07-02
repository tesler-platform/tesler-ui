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

import { bcSaveDataEpic } from '../bcSaveData'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import * as api from '../../../api/api'
import * as notifications from '../../../utils/notifications'
import { saveBcData } from '../../../api/api'
import { Observable } from 'rxjs'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import { $do } from '../../../actions/actions'
import { OperationTypeCrud, OperationError, OperationPostInvokeShowMessage, OperationPostInvokeType } from '../../../interfaces/operation'
import { DataItem, WidgetTypes } from '@tesler-ui/schema'
import { WidgetTableMeta } from '../../../interfaces/widget'
import { AppNotificationType } from '../../../interfaces/objectMap'

const saveBcDataApiMock = jest.fn().mockImplementation((...args: Parameters<typeof saveBcData>) => {
    const [screenName] = args
    if (screenName === 'crash') {
        return Observable.throw({
            response: {
                data: errorResponse
            }
        })
    }
    return Observable.of({
        record: dataItemExample,
        postActions: screenName === 'withPostInvoke' ? [postInvoke] : [],
        preInvoke: null
    })
})

const consoleMock = jest.fn()
const notificationMock = jest.fn()

jest.spyOn<any, any>(api, 'saveBcData').mockImplementation(saveBcDataApiMock)
jest.spyOn<any, any>(notifications, 'openButtonWarningNotification').mockImplementation(notificationMock)
jest.spyOn(console, 'error').mockImplementation(consoleMock)

describe('`bcSaveData` epic', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.screenName = 'test'
        store.getState().screen.bo.bc.bcExample = bcExample
        store.getState().screen.bo.bc.bcChild1 = bcChild1
        store.getState().screen.bo.bc.bcChild2 = bcChild2
        store.getState().data.bcExample = [{ id: '1', name: 'old', vstamp: 0 }]
        store.getState().view.pendingDataChanges = {
            bcExample: {
                '1': { name: 'new', age: 29 }
            }
        }
    })

    afterEach(() => {
        jest.clearAllMocks()
        store.getState().screen.screenName = 'test'
        store.getState().view.rowMeta = {}
        store.getState().view.widgets = []
    })

    it('sends saved record to Tesler API', () => {
        const action = $do.sendOperation({
            operationType: OperationTypeCrud.save,
            bcName: 'bcExample',
            widgetName: 'widget-example'
        })
        const epic = bcSaveDataEpic(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(saveBcDataApiMock).toBeCalledWith(
                'test',
                'bcExample/1',
                { vstamp: 0, name: 'new', age: 29 },
                { widgetName: 'widget-example' }
            )
        })
    })

    it('does not send changes for disabled fields (and does not break if row meta missing', () => {
        const action = $do.sendOperation({
            operationType: OperationTypeCrud.save,
            bcName: 'bcExample',
            widgetName: 'widget-example'
        })
        let epic = bcSaveDataEpic(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(saveBcDataApiMock).toBeCalledWith(
                'test',
                'bcExample/1',
                { vstamp: 0, name: 'new', age: 29 },
                { widgetName: 'widget-example' }
            )
        })
        store.getState().view.rowMeta = {
            bcExample: {
                'bcExample/1': {
                    actions: [],
                    fields: [
                        {
                            key: 'name',
                            currentValue: 'old',
                            disabled: true
                        }
                    ]
                }
            }
        }
        epic = bcSaveDataEpic(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(saveBcDataApiMock).toBeCalledWith('test', 'bcExample/1', { vstamp: 0, age: 29 }, { widgetName: 'widget-example' })
        })
    })

    it('on success fires `bcSaveDataSuccess` and `bcFetchRowMeta` actions', () => {
        const action = $do.sendOperation({
            operationType: OperationTypeCrud.save,
            bcName: 'bcExample',
            widgetName: 'widget-example'
        })
        const epic = bcSaveDataEpic(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(res[0]).toEqual(
                expect.objectContaining(
                    $do.bcSaveDataSuccess({
                        bcName: 'bcExample',
                        cursor: '1',
                        dataItem: dataItemExample
                    })
                )
            )
            expect(res[1]).toEqual(
                expect.objectContaining(
                    $do.bcFetchRowMeta({
                        bcName: 'bcExample',
                        widgetName: 'widget-example'
                    })
                )
            )
        })
    })

    it('on success schedules data fetch for children business components', () => {
        store.getState().view.widgets = [widgetMeta, widgetChild1, widgetChild2]
        const action = $do.sendOperation({
            operationType: OperationTypeCrud.save,
            bcName: 'bcExample',
            widgetName: 'widget-example'
        })
        const epic = bcSaveDataEpic(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(res[2]).toEqual(
                expect.objectContaining(
                    $do.bcFetchDataRequest({
                        bcName: 'bcChild1',
                        widgetName: 'child1'
                    })
                )
            )
            expect(res[3]).toEqual(
                expect.objectContaining(
                    $do.bcFetchDataRequest({
                        bcName: 'bcChild2',
                        widgetName: 'child2'
                    })
                )
            )
        })
    })

    it('handles post invokes and scheduled onSuccessAction callback from action payload', () => {
        store.getState().screen.screenName = 'withPostInvoke'
        const action = $do.sendOperation({
            operationType: OperationTypeCrud.save,
            bcName: 'bcExample',
            widgetName: 'widget-example',
            onSuccessAction: $do.emptyAction(null)
        })
        const epic = bcSaveDataEpic(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(res[2]).toEqual(
                expect.objectContaining(
                    $do.processPostInvoke({
                        bcName: 'bcExample',
                        widgetName: 'widget-example',
                        postInvoke,
                        cursor: '1'
                    })
                )
            )
            expect(res[3]).toEqual(expect.objectContaining($do.emptyAction(null)))
        })
    })

    it('fires `bcSaveDataFail` and writes in console on error', () => {
        store.getState().screen.screenName = 'crash'
        const brokenAction = $do.sendOperation({
            bcName: 'bcExample',
            widgetName: 'widget-example',
            operationType: OperationTypeCrud.save
        })
        const epic = bcSaveDataEpic(ActionsObservable.of(brokenAction), store)
        testEpic(epic, result => {
            expect(consoleMock).toBeCalledWith(
                expect.objectContaining({
                    response: {
                        data: errorResponse
                    }
                })
            )
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.bcSaveDataFail({
                        bcName: 'bcExample',
                        bcUrl: 'bcExample/1',
                        entityError: errorResponse.error.entity,
                        viewError: errorResponse.error.popup[0]
                    })
                )
            )
            expect(notificationMock).toBeCalledTimes(0)
        })
    })

    it('shows cancel pending changes notification when crash and success callback is set', () => {
        store.getState().screen.screenName = 'crash'
        const brokenAction = $do.sendOperation({
            bcName: 'bcExample',
            widgetName: 'widget-example',
            operationType: OperationTypeCrud.save,
            onSuccessAction: $do.emptyAction(null)
        })
        store.getState().view.widgets = [
            {
                ...widgetMeta,
                options: { disableNotification: true }
            }
        ]
        const dispatchMock = jest.fn()
        let epic = bcSaveDataEpic(ActionsObservable.of(brokenAction), { ...store, dispatch: dispatchMock })
        testEpic(epic, () => {
            expect(notificationMock).toBeCalledTimes(0)
            expect(dispatchMock).toBeCalledTimes(0)
        })
        store.getState().view.widgets = [widgetMeta]
        epic = bcSaveDataEpic(ActionsObservable.of(brokenAction), { ...store, dispatch: dispatchMock })
        testEpic(epic, () => {
            expect(notificationMock).toBeCalledTimes(1)
            const cancelButton = notificationMock.mock.calls[0][3]
            expect(dispatchMock).toBeCalledTimes(0)
            cancelButton()
            expect(dispatchMock).toBeCalledWith(
                expect.objectContaining(
                    $do.bcCancelPendingChanges({
                        bcNames: ['bcExample']
                    })
                )
            )
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

const bcChild1 = {
    name: 'bcChild1',
    parentName: 'bcExample',
    url: 'bcExample/:id/bcChild1',
    cursor: '',
    loading: false
}

const bcChild2 = {
    name: 'bcChild2',
    parentName: 'bcExample',
    url: 'bcExample/:id/bcChild2',
    cursor: '',
    loading: false
}

const widgetMeta: WidgetTableMeta = {
    name: 'widget-example',
    bcName: 'bcExample',
    type: WidgetTypes.List,
    title: '',
    position: 0,
    gridWidth: 0,
    fields: []
}

const widgetChild1 = { ...widgetMeta, bcName: 'bcChild1', name: 'child1' }
const widgetChild2 = { ...widgetMeta, bcName: 'bcChild2', name: 'child2' }

const dataItemExample: DataItem = {
    id: '1',
    vstamp: 1
}

const errorResponse: OperationError = {
    success: false,
    error: {
        entity: {
            bcName: 'bcExample',
            id: '1',
            fields: { name: 'name is not valid' }
        },
        popup: ['view crashed']
    }
}

const postInvoke: OperationPostInvokeShowMessage = {
    type: OperationPostInvokeType.showMessage,
    messageText: 'text',
    messageType: AppNotificationType.info
}
