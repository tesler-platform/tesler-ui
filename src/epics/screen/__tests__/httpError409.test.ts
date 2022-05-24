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
import { ActionsObservable, StateObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import { httpError409 } from '../httpError409'
import * as notifications from '../../../utils/notifications'
import { AxiosError } from 'axios'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'

const mock = jest.fn().mockImplementation()
jest.spyOn(notifications, 'openButtonWarningNotification').mockImplementation(mock)

describe('httpError409', () => {
    let store$: StateObservable<CoreStore> = null

    beforeAll(() => {
        store$ = createMockStateObservable()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('opens notification', () => {
        const error = getError()
        error.response.data.error = { popup: ['error message'] }
        const action = $do.httpError({
            statusCode: 409,
            error,
            callContext: { widgetName: 'widget-example' }
        })
        const epic = httpError409(ActionsObservable.of(action), store$)
        testEpic(epic, () => {
            expect(mock).toBeCalledWith('error message', 'OK', 0, null, 'action_edit_error')
        })
    })

    it('handles missing message', () => {
        const action = $do.httpError({
            statusCode: 409,
            error: getError(),
            callContext: { widgetName: 'widget-example' }
        })
        const epic = httpError409(ActionsObservable.of(action), store$)
        testEpic(epic, () => {
            expect(mock).toBeCalledWith('', 'OK', 0, null, 'action_edit_error')
        })
    })
})

function getError(): AxiosError {
    return {
        config: null,
        isAxiosError: true,
        name: 'test',
        message: 'test',
        response: {
            data: {},
            status: 500,
            statusText: 'error',
            headers: null,
            config: null
        }
    }
}
