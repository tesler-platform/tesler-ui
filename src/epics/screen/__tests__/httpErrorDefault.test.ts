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
import { httpErrorDefault } from '../httpErrorDefault'
import { AxiosError } from 'axios'
import { ApplicationError, ApplicationErrorType } from '../../../interfaces/view'
import { knownHttpErrors } from '../apiError'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'

describe('httpErrorDefault', () => {
    let store$: StateObservable<CoreStore> = null

    beforeAll(() => {
        store$ = createMockStateObservable()
    })

    it('dispatches `showViewError` with business error', () => {
        const action = $do.httpError({
            statusCode: 999,
            error: axiosError,
            callContext: { widgetName: 'widget-example' }
        })
        const epic = httpErrorDefault(ActionsObservable.of(action), store$)
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

    it('fires only for unknown http statuses', () => {
        knownHttpErrors.forEach(statusCode => {
            const action = $do.httpError({
                statusCode,
                error: null,
                callContext: { widgetName: 'widget-example' }
            })
            const epic = httpErrorDefault(ActionsObservable.of(action), store$)
            testEpic(epic, result => {
                expect(result.length).toBe(0)
            })
        })
    })
})

const axiosError: AxiosError = {
    config: null,
    isAxiosError: true,
    name: 'test',
    message: 'test',
    response: {
        data: 'error details',
        status: 999,
        statusText: 'error',
        headers: null,
        config: null
    }
}

const applicationError: ApplicationError = {
    type: ApplicationErrorType.BusinessError,
    details: axiosError.response.data,
    code: 999
}
