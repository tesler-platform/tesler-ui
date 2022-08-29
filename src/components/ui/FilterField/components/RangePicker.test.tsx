import { mount } from 'enzyme'
import React from 'react'
import RangePicker from './RangePicker'

describe('RangePicker test', () => {
    const onChangeMock = jest.fn()

    it('should render two pickers', function () {
        const wrapper = mount(<RangePicker onChange={onChangeMock} value={null} />)
        expect(wrapper.find('PickerWrapper').length).toBe(2)
    })
    it('should call "onChange"', function () {
        const wrapper = mount(<RangePicker onChange={onChangeMock} value={null} />)
        const startPicker = mount(wrapper.find('PickerWrapper').get(0))
        startPicker
            .find('Icon')
            .findWhere(i => i.props().type === 'calendar')
            .at(0)
            .simulate('click')
        startPicker
            .find('.ant-calendar-date')
            .findWhere(i => i.props()['aria-disabled'] === false)
            .at(0)
            .simulate('click')
        expect(onChangeMock).toHaveBeenCalled()
    })
})
