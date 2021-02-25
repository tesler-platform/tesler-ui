import { shallow } from 'enzyme'
import CopyableText from '../CopyableText'
import React from 'react'

describe('CopyableText', () => {
    const wrapper = shallow(<CopyableText text="some text" />)
    it('should render Input', () => {
        expect(wrapper.find('Input').length).toBe(1)
    })
})
