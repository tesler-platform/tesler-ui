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

import {flattenOperations, matchOperationRole} from '../operations'
import {Operation, OperationTypeCrud} from '../../interfaces/operation'
import {mockStore} from '../../tests/mockStore'
import {ActionPayloadTypes} from '../../actions/actions'

test('flattenOperations', () => {
    const operations = flattenOperations([
        create,
        save,
        {
            actions: [
                update,
                edit
            ],
            text: 'Group1',
            maxGroupVisualButtonsCount: 1
        },
        unsave,
        {
            actions: [
                cancel,
                associate,
            ],
            text: 'Group2',
            maxGroupVisualButtonsCount: 1
        },
    ])
    expect(operations).toEqual(expect.arrayContaining([ create, save, update, edit, unsave, cancel, associate ]))
    expect(flattenOperations(null)).toHaveLength(0)
})

test('matchOperationRole', () => {
    const store = mockStore().getState()
    store.screen.bo.bc.bcExample = {
        name: 'bcExample',
        parentName: null,
        url: 'bcExample',
        cursor: null
    }
    store.view.rowMeta.bcExample = {
        bcExample: {
            actions: [ create, save, update, edit, unsave, cancel, associate ],
            fields: []
        }
    }
    expect(matchOperationRole(OperationTypeCrud.create, sendOperationCreate, store)).toBeTruthy()
    expect(matchOperationRole(OperationTypeCrud.save, sendOperationCreate, store)).toBeFalsy()
    expect(matchOperationRole(OperationTypeCrud.save, sendOperationUpdate, store)).toBeTruthy()
    expect(matchOperationRole(OperationTypeCrud.save, sendOperationUnsave, store)).toBeFalsy()
    expect(matchOperationRole(OperationTypeCrud.cancelCreate, sendOperationUnsave, store)).toBeTruthy()
    expect(matchOperationRole('none', sendOperationCustom, store)).toBeTruthy()
    expect(matchOperationRole('none', sendOperationCreate, store)).toBeFalsy()
    expect(matchOperationRole('none', sendOperationUnsave, store)).toBeFalsy()
})


test('matchOperationRole missing row meta', () => {
    const store = mockStore().getState()
    store.screen.bo.bc.bcMissing = {
        name: 'bcMissing',
        parentName: null,
        url: 'bcMissing',
        cursor: null
    }
    store.screen.bo.bc.bcExample = {
        name: 'bcExample',
        parentName: null,
        url: 'bcExample',
        cursor: '4'
    }
    store.view.rowMeta.bcExample = {
        bcExample: {
            actions: [ create, save, update, edit, unsave, cancel, associate ],
            fields: []
        }
    }
    expect(matchOperationRole(OperationTypeCrud.create, sendOperationCreate, store)).toBeTruthy()
    expect(matchOperationRole(OperationTypeCrud.save, sendOperationUpdate, store)).toBeFalsy()
    expect(matchOperationRole(OperationTypeCrud.save, sendOperationUnsave, store)).toBeFalsy()
    expect(matchOperationRole(OperationTypeCrud.cancelCreate, sendOperationCustom, store)).toBeFalsy()
    expect(matchOperationRole('none', sendOperationCreate, store)).toBeFalsy()
    expect(matchOperationRole('none', { ...sendOperationUpdate, bcName: 'bcNameMissing' }, store)).toBeTruthy()
    expect(matchOperationRole('none', sendOperationUnsave, store)).toBeTruthy()
    expect(matchOperationRole('none', sendOperationCustom, store)).toBeTruthy()
})

const create: Operation = { type: OperationTypeCrud.create, scope: 'record', text: 'Create', showOnlyIcon: false }
const save: Operation = { type: OperationTypeCrud.save, scope: 'record', text: 'Save', showOnlyIcon: false }
const update: Operation = { type: 'update', scope: 'record', text: 'Update', showOnlyIcon: false, actionRole: OperationTypeCrud.save }
const edit: Operation = { type: 'edit', scope: 'record', text: 'Edit', showOnlyIcon: false, actionRole: OperationTypeCrud.save }
const cancel: Operation = { type: OperationTypeCrud.cancelCreate, scope: 'record', text: 'Cancel', showOnlyIcon: false }
const associate: Operation = { type: OperationTypeCrud.associate, scope: 'record', text: 'Associate', showOnlyIcon: false }
const custom: Operation = { type: 'custom', scope: 'record', text: 'Custom', showOnlyIcon: false }
const unsave: Operation = {
    type: 'unsave',
    scope: 'record',
    text: 'Unsave',
    showOnlyIcon: false,
    actionRole: OperationTypeCrud.cancelCreate
}

const sendOperationCreate: ActionPayloadTypes['sendOperation'] = {
    bcName: 'bcExample',
    operationType: create.type,
    widgetName: 'widget-example',
}

const sendOperationUpdate: ActionPayloadTypes['sendOperation'] = {
    bcName: 'bcExample',
    operationType: update.type,
    widgetName: 'widget-example',
}

const sendOperationUnsave: ActionPayloadTypes['sendOperation'] = {
    bcName: 'bcExample',
    operationType: unsave.type,
    widgetName: 'widget-example',
}

const sendOperationCustom: ActionPayloadTypes['sendOperation'] = {
    bcName: 'bcExample',
    operationType: custom.type,
    widgetName: 'widget-example',
}
