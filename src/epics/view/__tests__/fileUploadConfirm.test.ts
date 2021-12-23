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
import { fileUploadConfirm } from '../fileUploadConfirm'
import { $do, types as coreActions } from '../../../actions/actions'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import * as api from '../../../api/api'
import { customAction } from '../../../api/api'
import { Observable } from 'rxjs'

const customActionMock = jest.fn().mockImplementation((args: Parameters<typeof customAction>) => {
    return Observable.of({ record: null, postActions: [], preInvoke: null })
})

jest.spyOn<any, any>(api, 'customAction').mockImplementation(customActionMock)

describe('fileUploadConfirm', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.screenName = 'test'
        store.getState().screen.bo.bc.bcExample = bcExample
        store.getState().view.widgets = [getWidgetMeta()]
        store.getState().view.popupData = { bcName: 'bcExample' }
    })

    afterEach(() => {
        store.getState().view.widgets = [getWidgetMeta()]
    })

    it('sends `customAction` request', () => {
        store.getState().view.widgets[0] = { ...getWidgetMeta(), bcName: 'missingBc' }
        const action = $do.bulkUploadFiles({
            fileIds: ['123', '567']
        })
        const epic = fileUploadConfirm(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(customActionMock).toBeCalledWith(
                'test',
                'bcExample/1',
                {
                    bulkIds: action.payload.fileIds
                },
                null,
                { _action: 'file-upload-save' }
            )
        })
    })

    it('fires `sendOperationSuccess`, `bcForceUpdate` and `closeViewPopup` actions', () => {
        const action = $do.bulkUploadFiles({
            fileIds: ['123', '567']
        })
        const epic = fileUploadConfirm(ActionsObservable.of(action), store)

        testEpic(epic, result => {
            expect(result.length).toBe(3)
            expect(result[0]).toEqual(
                expect.objectContaining({
                    type: coreActions.sendOperationSuccess,
                    payload: { bcName: 'bcExample', cursor: null }
                })
            )
            expect(result[1]).toEqual(
                expect.objectContaining({
                    type: coreActions.bcForceUpdate,
                    payload: { bcName: 'bcExample', widgetName: 'widget-example' }
                })
            )
            expect(result[2]).toEqual(
                expect.objectContaining({
                    type: coreActions.closeViewPopup,
                    payload: null
                })
            )
        })
    })

    it.skip('processes post and preinvokes', () => {
        /**
         * TODO
         */
    })
})

function getWidgetMeta(): WidgetTableMeta {
    return {
        name: 'widget-example',
        type: WidgetTypes.AssocListPopup,
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
        ],
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
