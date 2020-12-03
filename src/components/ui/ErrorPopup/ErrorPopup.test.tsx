import {ApplicationErrorType, BusinessError, SystemError} from '../../../interfaces/view'
import {shallow} from 'enzyme'
import * as React from 'react'
import ErrorPopup from './ErrorPopup'

describe('ErrorPopup test', () => {

    const systemErrorWithError: SystemError = {
        type: ApplicationErrorType.SystemError,
        details: 'System error',
        error: {
            name: 'error name',
            message: 'error message',
            response: {
                data: null,
                status: 500,
                statusText: 'Internal server error',
                headers: {},
              config: {
                url: '//qwe/qeqwe/qweqw'
              }
            },
            config: {
            },
            isAxiosError: false
        }
    }

    const systemErrorWithoutError: SystemError = {
        type: ApplicationErrorType.SystemError,
        details: 'System error'
    }
    const businessError: BusinessError = {
        type: ApplicationErrorType.BusinessError,
        message: 'Business error'
    }
    it('should display business error', () => {
        const wrapper = shallow(<ErrorPopup
            error={businessError}
        />)
        expect(wrapper.find('FormItem').findWhere(i => i.text() === businessError.message).length).toEqual(1)
    })
    it('should display system error with axios error', () => {
        const wrapper = shallow(<ErrorPopup
            error={systemErrorWithError}
        />)
        expect(wrapper.find('textarea').length).toEqual(1)
        expect(wrapper.find('Button').length).toEqual(1)
    })
    it('should display system error without axios error', () => {
        const wrapper = shallow(<ErrorPopup
            error={systemErrorWithoutError}
        />)
        expect(wrapper.find('textarea').length).toEqual(0)
        expect(wrapper.find('Button').length).toEqual(0)

    })
})
