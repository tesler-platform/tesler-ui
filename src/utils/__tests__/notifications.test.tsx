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

import { openButtonWarningNotification } from '../notifications'
import { notification, Button } from 'antd'
import i18n from 'i18next'

const warningMock = jest.fn()
const closeMock = jest.fn()
jest.spyOn(notification, 'warning').mockImplementation(args => {
    return warningMock(args)
})
jest.spyOn(notification, 'close').mockImplementation(args => {
    return closeMock(args)
})
jest.spyOn(Date, 'now').mockImplementation(() => {
    return 1609942997379
})
jest.spyOn(i18n, 't').mockImplementation(() => {
    return 'Attention'
})

describe('openButtonWarningNotification', () => {
    afterEach(() => {
        warningMock.mockClear()
        closeMock.mockClear()
    })

    it('opens antd notification with button firing callback and close', () => {
        const callback = jest.fn()
        openButtonWarningNotification('description', 'send', 10, callback)
        expect(warningMock.mock.calls[0].length).toBe(1)
        const arg = warningMock.mock.calls[0][0]
        expect(warningMock).toBeCalledWith(
            expect.objectContaining({
                description: 'description',
                duration: 10,
                message: 'Attention',
                key: 'notification_1609942997379'
            })
        )
        expect(arg.btn.type).toBe(Button)
        expect(arg.btn.props.children).toBe('send')
        arg.btn.props.onClick()
        expect(callback).toBeCalledTimes(1)
        expect(closeMock).toBeCalledWith('notification_1609942997379')
    })

    it('closes previous notification with the same key', () => {
        expect(closeMock).toBeCalledTimes(0)
        openButtonWarningNotification('description', 'send', undefined, undefined, 'key')
        expect(warningMock).toBeCalledWith(
            expect.objectContaining({
                key: 'key'
            })
        )
        expect(closeMock).toHaveBeenNthCalledWith(1, 'key')
        const arg = warningMock.mock.calls[0][0]
        arg.btn.props.onClick()
        expect(closeMock).toHaveBeenNthCalledWith(2, 'key')
        expect(closeMock).toBeCalledTimes(2)
    })
})
