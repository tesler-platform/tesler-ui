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

import {$do} from '../../../actions/actions'
import {Store} from 'redux'
import {Store as CoreStore} from '../../../interfaces/store'
import {mockStore} from '../../../tests/mockStore'
import {ActionsObservable} from 'redux-observable'
import {testEpic } from '../../../tests/testEpic'
import {httpError500} from '../httpError500'
import {AxiosError} from 'axios'
import {ApplicationError, ApplicationErrorType} from '../../../interfaces/view'

describe('httpError500', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })

    it('dispatches `showViewError` with system error', () => {
        const action = $do.httpError({
            statusCode: 500,
            error: axiosError,
            callContext: { widgetName: 'widget-example' }
        })
        const epic = httpError500(ActionsObservable.of(action), store)
        testEpic(epic, (result) => {
            expect(result[0]).toEqual(expect.objectContaining($do.showViewError({
                error: applicationError
            })))
        })
    })
})

const axiosError: AxiosError = {
    config: null,
    isAxiosError: true,
    name: 'test',
    message: 'test',
    response: {
        data: {

        },
        status: 500,
        statusText: 'error',
        headers: null,
        config: null
    }
}

const applicationError: ApplicationError = {
    type: ApplicationErrorType.SystemError,
    details: axiosError.response.statusText,
    error: axiosError
}
