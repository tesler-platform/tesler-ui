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
import {fileUploadConfirm} from '../fileUploadConfirm'
import {$do, types as coreActions} from '../../../actions/actions'
import {ActionsObservable} from 'redux-observable'
import {testEpic} from '../../../tests/testEpic'

describe('fileUploadConfirm', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.screenName = 'test'
        store.getState().screen.bo.bc.bcExample = bcExample
        store.getState().data.bcExample = [{ id: '1', name: 'one', vstamp: 0 }]
        store.getState().data.bcExamplePopup = [{ id: '9', name: 'one', vstamp: 0, _associate: true }]
        store.getState().view.widgets = [getWidgetMeta()]
        store.getState().view.popupData = { bcName: 'bcExample' }
    })

    afterEach(() => {
        store.getState().screen.bo.bc.bcExample = bcExample
        store.getState().view.widgets = [getWidgetMeta()]
    })

    it.skip('sets a new value for field bc', () => {
        const action = $do.bulkUploadFiles({
            fileIds: ['123', '567']
        })
        const epic = fileUploadConfirm(ActionsObservable.of(action), store)

        testEpic(epic, (result) => {
            expect(result.length).toBe(3)
            expect(result[0]).toEqual(expect.objectContaining({
                type: coreActions.sendOperationSuccess,
                payload:  { bcName: 'bcExample', cursor: null }
            }))
            expect(result[1]).toEqual(expect.objectContaining({
                type: coreActions.bcForceUpdate,
                payload:  { bcName: 'bcExample' }
            }))
            expect(result[2]).toEqual(expect.objectContaining({
                type: coreActions.closeViewPopup,
                payload:  { bcName: 'bcForceUpdate' }
            }))
        })
    })

})

function getWidgetMeta(): WidgetTableMeta {
    return {
        name: 'widget-example',
        type: WidgetTypes.AssocListPopup,
        title: null,
        bcName: 'bcExamplePopup',
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
