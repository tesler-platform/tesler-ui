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
import { createPreInvokeMiddleware } from '../preInvokeMiddleware'
import { mockStore } from '../../tests/mockStore'
import { $do, types } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { OperationTypeCrud, Operation, OperationPreInvoke, OperationPreInvokeType } from '../../interfaces/operation'
import { WidgetTypes } from '../../interfaces/widget'
import { RowMeta } from '../../interfaces/rowMeta'

describe('requiredFieldsMiddleware', () => {
    let store: Store<CoreStore>
    const next = jest.fn().mockImplementation(action => {
        return action
    })
    /* eslint-disable @typescript-eslint/unbound-method */
    const middleware = createPreInvokeMiddleware()({ getState: mockStore().getState, dispatch: next })

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.bo.bc = bc
        store.getState().view.rowMeta = {
            bcExample: {
                'bcExample/1': rowMeta
            }
        }
        store.getState().view.widgets = [widget]
    })

    afterEach(() => {
        next.mockClear()
        store.getState().view.rowMeta.bcExample['bcExample/1'] = rowMeta
        store.getState().screen.bo.bc.bcExample.cursor = '1'
    })

    it('returns `processPreInvoke` if row meta specifies preinvoke', () => {
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: 'associate',
            widgetName: 'widget-example'
        })
        expect(middleware(next)(action)).toEqual(
            expect.objectContaining({
                type: types.processPreInvoke,
                payload: {
                    bcName: 'bcExample',
                    operationType: 'associate',
                    widgetName: 'widget-example',
                    preInvoke
                }
            })
        )
    })

    it('returns original action when action has no preinvoke or payload contains `confirm` ', () => {
        const confirmAction = $do.sendOperation({
            bcName: 'bcExample',
            operationType: 'associate',
            widgetName: 'widget-example',
            confirm: 'Are you sure?'
        })
        expect(middleware(next)(confirmAction)).toBe(confirmAction)
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: 'associate',
            widgetName: 'widget-example'
        })
        store.getState().view.rowMeta.bcExample['bcExample/1'] = {
            ...rowMeta,
            actions: [{ ...rowMetaAction, preInvoke: null }]
        }
        expect(middleware(next)(action)).toBe(action)
    })

    it('fires only for `sendOperation` action', () => {
        const otherAction = $do.emptyAction(null)
        expect(middleware(next)(otherAction)).toBe(otherAction)
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: 'associate',
            widgetName: 'widget-example'
        })
        expect(middleware(next)(action)).toEqual(
            expect.objectContaining({
                type: types.processPreInvoke,
                payload: {
                    bcName: 'bcExample',
                    operationType: 'associate',
                    widgetName: 'widget-example',
                    preInvoke
                }
            })
        )
    })

    it('does not break when bc, widget, rowmeta or action are missing', () => {
        store.getState().screen.bo.bc.bcExample.cursor = '2'
        const missingBcAction = $do.sendOperation({
            bcName: 'bcMissing',
            operationType: 'associate',
            widgetName: 'widget-example'
        })
        expect(middleware(next)(missingBcAction)).toBe(missingBcAction)
        const missingRowMetaAction = $do.sendOperation({
            bcName: 'bcExample',
            operationType: 'associate',
            widgetName: 'widget-example'
        })
        store.getState().view.rowMeta.bcExample = undefined
        expect(middleware(next)(missingRowMetaAction)).toBe(missingRowMetaAction)
        store.getState().view.rowMeta.bcExample = { ['bcExample/1']: rowMeta }
        const missingWidgetAction = $do.sendOperation({
            bcName: 'bcExample',
            operationType: 'associate',
            widgetName: 'widget-missing'
        })
        expect(middleware(next)(missingWidgetAction)).toBe(missingWidgetAction)
        const missingOperationAction = $do.sendOperation({
            bcName: 'bcExample',
            operationType: 'save',
            widgetName: 'widget-missing'
        })
        expect(middleware(next)(missingOperationAction)).toBe(missingOperationAction)
    })
})

const preInvoke: OperationPreInvoke = {
    type: OperationPreInvokeType.info,
    message: 'message'
}

const rowMetaAction: Operation = {
    type: OperationTypeCrud.associate,
    text: 'text',
    scope: 'associate',
    preInvoke
}

const rowMeta: RowMeta = {
    actions: [rowMetaAction],
    fields: [
        {
            key: 'test',
            currentValue: null,
            required: true
        }
    ]
}

const widget = {
    name: 'widget-example',
    type: WidgetTypes.List,
    fields: [{ key: 'test', type: 'input', label: 'labe' }],
    position: 0,
    title: '',
    bcName: 'bcExample',
    gridWidth: 0
}

const bc = {
    bcExample: {
        cursor: '1',
        name: 'bcExample',
        parentName: '',
        url: 'bcExample'
    }
}
