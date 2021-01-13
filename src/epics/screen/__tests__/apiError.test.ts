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
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import { apiError } from '../apiError'
import axios, { AxiosError } from 'axios'
import { ApplicationErrorType } from '../../../interfaces/view'
import { knownHttpErrors } from '../apiError'

const dispatch = jest.fn()
jest.spyOn(axios, 'isCancel').mockImplementation((e: AxiosError) => {
    return e.name === 'cancelled'
})

describe('apiError', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.dispatch = dispatch
    })

    it('dispatches `httpError` when http status available', () => {
        const callContext = { widgetName: 'widget-example' }
        knownHttpErrors.forEach(statusCode => {
            const error = getAxiosError(statusCode)
            const action = $do.apiError({
                error,
                callContext
            })
            const epic = apiError(ActionsObservable.of(action), store)
            testEpic(epic, result => {
                expect(result[0]).toEqual(
                    expect.objectContaining(
                        $do.httpError({
                            statusCode: error.response.status,
                            error,
                            callContext
                        })
                    )
                )
            })
        })
        const unknownStatusError = getAxiosError(999)
        const unkownStatusAction = $do.apiError({
            error: unknownStatusError,
            callContext: { widgetName: 'widget-example' }
        })
        const unknownStatusEpic = apiError(ActionsObservable.of(unkownStatusAction), store)
        testEpic(unknownStatusEpic, result => {
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.httpError({
                        statusCode: 999,
                        error: unknownStatusError,
                        callContext
                    })
                )
            )
        })
    })

    it('dispatches `showViewError` for network error', () => {
        const error = getAxiosError(null)
        delete error.response
        const action = $do.apiError({
            error,
            callContext: { widgetName: 'widget-example' }
        })
        const epic = apiError(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.showViewError({
                        error: {
                            type: ApplicationErrorType.NetworkError
                        }
                    })
                )
            )
        })
    })

    it('does not show network errors for cancelled requests', () => {
        const error = getAxiosError(null)
        delete error.response
        error.name = 'cancelled'
        const action = $do.apiError({
            error,
            callContext: { widgetName: 'widget-example' }
        })
        const epic = apiError(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(result.length).toBe(0)
        })
    })
})

function getAxiosError(status: number): AxiosError {
    return {
        config: null,
        isAxiosError: true,
        name: 'test',
        message: 'test',
        response: {
            data: {},
            status,
            statusText: 'error',
            headers: null,
            config: null
        }
    }
}
