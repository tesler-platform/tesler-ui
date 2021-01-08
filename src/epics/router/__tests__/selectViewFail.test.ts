/*
 * TESLER-UI
 * Copyright (C) 2018-2021 Tesler Contributors
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

import {testEpic} from '../../../tests/testEpic'
import {$do} from '../../../actions/actions'
import {ActionsObservable} from 'redux-observable'
import {mockStore } from '../../../tests/mockStore'
import {Store} from 'redux'
import {Store as CoreStore} from '../../../interfaces/store'
import {notification} from 'antd'
import {selectViewFail} from '../selectViewFail'
import i18n from 'i18next'

const notificationMock = jest.fn()
const i18nMock = jest.fn().mockImplementation((token, variable) => {
    return `View ${variable.viewName} is missing or unavailable for your role`
})

jest.spyOn(notification, 'error').mockImplementation(notificationMock)
jest.spyOn(i18n, 't').mockImplementation(i18nMock)

describe('selectViewFail', () => {

    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })

    it('shows notification with error message and view name', () => {
        const action = $do.selectViewFail({ viewName: 'view-example' })
        const epic = selectViewFail(ActionsObservable.of(action), store)
        testEpic(epic, (res) => {
            expect(res.length).toBe(0)
            expect(notificationMock).toBeCalledWith({
                duration: 15,
                message: 'View view-example is missing or unavailable for your role'
            })
        })
    })
})
