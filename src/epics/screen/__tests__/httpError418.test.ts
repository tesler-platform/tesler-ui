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

import { $do } from '../../../actions/actions'
import { Store as CoreStore } from '../../../interfaces/store'
import { StateObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import { httpError418 } from '../httpError418'
import { AxiosError } from 'axios'
import { ApplicationErrorType, BusinessError } from '../../../interfaces/view'
import { OperationError, OperationPostInvokeType } from '../../../interfaces/operation'
import { WidgetTableMeta, WidgetTypes } from '../../../interfaces/widget'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'
import { of as observableOf } from 'rxjs'

describe('httpError418', () => {
    let store$: StateObservable<CoreStore> = null

    beforeAll(() => {
        store$ = createMockStateObservable()
        store$.value.view.widgets = [widget]
    })

    it('dispatches `showViewError` with business error', () => {
        const action = $do.httpError({
            statusCode: 418,
            error: getAxiosError(),
            callContext: { widgetName: 'widget-example' }
        })
        const epic = httpError418(observableOf(action), store$)
        testEpic(epic, result => {
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.showViewError({
                        error: applicationError
                    })
                )
            )
        })
    })

    it('handles post invoke', () => {
        const error = getAxiosError()
        const postInvoke = {
            type: OperationPostInvokeType.refreshBC,
            message: 'Message'
        }
        error.response.data.error.postActions = [postInvoke]
        const action = $do.httpError({
            statusCode: 418,
            error,
            callContext: { widgetName: 'widget-example' }
        })
        const epic = httpError418(observableOf(action), store$)
        testEpic(epic, result => {
            expect(result[1]).toEqual(
                expect.objectContaining(
                    $do.processPostInvoke({
                        bcName: widget.bcName,
                        widgetName: widget.name,
                        postInvoke
                    })
                )
            )
        })
    })

    it('does nothing if no `popup` in Tesler API response', () => {
        const error = getAxiosError()
        error.response.data.error.popup = undefined
        const action = $do.httpError({
            statusCode: 418,
            error,
            callContext: { widgetName: 'widget-example' }
        })
        const epic = httpError418(observableOf(action), store$)
        testEpic(epic, result => {
            expect(result.length).toBe(0)
        })
    })
})

function getAxiosError(): AxiosError<OperationError> {
    return {
        config: null,
        isAxiosError: true,
        name: 'test',
        message: 'test',
        response: {
            data: {
                success: false,
                error: {
                    popup: ['Business Exception']
                }
            },
            status: 418,
            statusText: 'error',
            headers: null,
            config: null
        }
    }
}

const applicationError: BusinessError = {
    type: ApplicationErrorType.BusinessError,
    message: getAxiosError().response.data.error.popup[0]
}

const widget: WidgetTableMeta = {
    name: 'widget-example',
    type: WidgetTypes.List,
    title: null,
    bcName: 'bcExample',
    position: 1,
    gridWidth: null,
    fields: []
}
