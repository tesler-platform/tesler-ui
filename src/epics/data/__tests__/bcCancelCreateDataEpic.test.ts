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

import {Store} from 'redux'
import {Store as CoreStore} from '../../../interfaces/store'
import {mockStore} from '../../../tests/mockStore'
import {WidgetTableMeta, WidgetTypes} from '../../../interfaces/widget'
import {FieldType} from '../../../interfaces/view'
import {bcCancelCreateDataEpic} from '../bcCancelCreateDataEpic'
import {$do, types as coreActions} from '../../../actions/actions'
import {ActionsObservable} from 'redux-observable'
import {testEpic} from '../../../tests/testEpic'
import * as api from '../../../api/api'
import {customAction} from '../../../api/api'
import {Observable} from 'rxjs'
import {OperationTypeCrud, OperationPostInvokeRefreshBc, OperationPostInvokeType} from '../../../interfaces/operation'

const customActionMock = jest.fn().mockImplementation((...args: Parameters<typeof customAction>) => {
    const [screenName] = args
    if (screenName === 'crash') {
        return Observable.throw('test request crash')
    }
    return Observable.of({ record: null,
        postActions: screenName === 'withPostInvoke' ? [postInvoke] : [],
        preInvoke: null
    })
})

const consoleMock = jest.fn()

jest.spyOn<any, any>(api, 'customAction').mockImplementation(customActionMock)
jest.spyOn(console, 'error').mockImplementation(consoleMock)

describe('bcCancelCreateDataEpic', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.screenName = 'test'
        store.getState().screen.bo.bc.bcExample = bcExample
        store.getState().view.widgets = [getWidgetMeta()]
        store.getState().view.pendingDataChanges = { bcExample: { '1': { field2: '0000' } } }
        store.getState().data.bcExample = [{ id: '1', vstamp: 4, field1: 'text', field2: 'exter'  }]
    })

    afterEach(() => {
        store.getState().view.widgets = [getWidgetMeta()]
        store.getState().screen.screenName = 'test'
        jest.clearAllMocks()
    })

    it('sends `customAction` request', () => {
        store.getState().view.widgets[0] = { ...getWidgetMeta(), bcName: 'missingBc' }
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: OperationTypeCrud.cancelCreate,
            widgetName: 'widget-example'
        })
        const epic = bcCancelCreateDataEpic(ActionsObservable.of(action), store)
        testEpic(epic, () => {
            expect(customActionMock).toBeCalledWith('test', 'bcExample/1', {
                vstamp: 4,
                field2: '0000'
            }, { widgetName: 'widget-example' }, { _action: OperationTypeCrud.cancelCreate })
        })
    })

    it('fires `sendOperationSuccess`, drops bc cursor and process post invoke', () => {
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: OperationTypeCrud.cancelCreate,
            widgetName: 'widget-example'
        })
        const epic = bcCancelCreateDataEpic(ActionsObservable.of(action), store)

        testEpic(epic, (result) => {
            expect(result.length).toBe(2)
            expect(result[0]).toEqual(expect.objectContaining({
                type: coreActions.sendOperationSuccess,
                payload: { bcName: 'bcExample', cursor: '1' }
            }))
            expect(result[1]).toEqual(expect.objectContaining({
                type: coreActions.bcChangeCursors,
                payload: { cursorsMap: { bcExample: null } }
            }))
        })
    })

    it('processs post invoke', () => {
        store.getState().screen.screenName = 'withPostInvoke'
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: OperationTypeCrud.cancelCreate,
            widgetName: 'widget-example'
        })
        const epic = bcCancelCreateDataEpic(ActionsObservable.of(action), store)

        testEpic(epic, (result) => {
            expect(result.length).toBe(3)
            expect(result[2]).toEqual(expect.objectContaining({
                type: coreActions.processPostInvoke,
                payload:  {
                    bcName: 'bcExample',
                    postInvoke,
                    cursor: '1',
                    widgetName: 'widget-example'
                }
            }))
        })
    })

    it('dispatch `bcDeleteDataFail` and console error on crash', () => {
        store.getState().screen.screenName = 'crash'
        const action = $do.sendOperation({
            bcName: 'bcMissing',
            operationType: OperationTypeCrud.cancelCreate,
            widgetName: 'widget-example'
        })
        const epic = bcCancelCreateDataEpic(ActionsObservable.of(action), store)

        testEpic(epic, (result) => {
            expect(consoleMock).toBeCalled()
            expect(result.length).toBe(1)
            expect(result[0]).toEqual(expect.objectContaining({
                type: coreActions.bcDeleteDataFail,
                payload:  { bcName: 'bcMissing' }
            }))
        })
    })

})

const postInvoke: OperationPostInvokeRefreshBc = {
    bc: 'bcExample',
    type: OperationPostInvokeType.refreshBC
}

function getWidgetMeta(): WidgetTableMeta {
    return {
        name: 'widget-example',
        type: WidgetTypes.AssocListPopup,
        title: null,
        bcName: 'bcExample',
        position: 1,
        gridWidth: null,
        fields: [{
            key: 'name',
            title: 'Test Column',
            type: FieldType.input
        }],
        options: {
            hierarchyFull: true
        }
    }
}

const bcExample = {
    name: 'bcExample',
    parentName: null as string,
    url: 'bcExample/:id',
    cursor: '1',
    loading: false
}
