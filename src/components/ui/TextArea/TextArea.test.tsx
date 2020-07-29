import React from 'react'
import {TextArea} from './TextArea'
import {shallow} from 'enzyme'

describe('TextArea test', () => {

    it('should render ReadOnlyField', () => {
        const wrapper = shallow(<TextArea defaultValue={'test'} readOnly/>)
        expect(wrapper.find('Memo(ReadOnlyField)').findWhere(i => i.text() === 'test').length).toBeGreaterThan(0)
    })

    it('should render antd TextArea', () => {
        const wrapper = shallow(<TextArea defaultValue={'test'}/>)
        expect(wrapper.find('TextArea').findWhere(i => i.prop('defaultValue') === 'test').length).toEqual(1)
    })

    it('should render antd Popover', () => {
        const wrapper = shallow(<TextArea defaultValue={'testPopover'} popover/>)
        expect(wrapper.find('Popover').length).toEqual(1)
    })
})
