import React from 'react'
import { TextArea } from './TextArea'
import { shallow } from 'enzyme'
import { BaseFieldProps } from '../../Field/Field'
import { FieldType } from '../../../interfaces/view'

describe('TextArea test', () => {
    it('should render ReadOnlyField', () => {
        const wrapper = shallow(<TextArea {...baseFieldProps} defaultValue="test" readOnly />)
        expect(wrapper.find('Memo(ReadOnlyField)').findWhere(i => i.text() === 'test').length).toBeGreaterThan(0)
    })

    it('should render antd TextArea', () => {
        const wrapper = shallow(<TextArea {...baseFieldProps} defaultValue="test" />)
        expect(wrapper.find('TextArea').findWhere(i => i.prop('defaultValue') === 'test').length).toEqual(1)
    })

    it('should render antd Popover', () => {
        const wrapper = shallow(<TextArea {...baseFieldProps} defaultValue="test" popover />)
        expect(wrapper.find('Popover').length).toEqual(1)
    })
})

const baseFieldProps: BaseFieldProps = {
    widgetName: 'widget-example',
    cursor: null,
    meta: {
        type: FieldType.text,
        key: 'field-example'
    }
}
