import { mount, shallow } from 'enzyme'
import Dictionary, { DictionaryProps, getIconByParams } from './Dictionary'
import * as React from 'react'
import { MultivalueSingleValue } from '../../../interfaces/data'
import { FieldType } from '../../../interfaces/view'
import { BaseFieldProps } from '../../Field/Field'

const defValues = [
    { value: 'German' },
    { value: 'Danish' },
    { value: 'Low German' },
    { value: 'Sorbian' },
    { value: 'Romany' },
    { value: 'Frisian' },
    { value: 'English' },
    { value: 'Scots' },
    { value: 'Welsh' },
    { value: 'Russian' },
    { value: 'Ukrainian' },
    { value: 'Buryat' },
    { value: 'Udmurt' },
    { value: 'French' },
    { value: 'Portuguese' },
    { value: 'Spanish' }
]
const defFieldName = 'languageList'

describe('Dictionary test in default mode', () => {
    const props: DictionaryProps = {
        ...baseFieldProps,
        value: 'Spanish',
        fieldName: defFieldName,
        values: defValues
    }

    it('should be rendered', () => {
        const wrapper = shallow(<Dictionary {...props} />)
        expect(wrapper.find('Select').length).toEqual(1)
    })

    it('should handle onChange', () => {
        const rProps = { ...props }
        rProps.onChange = jest.fn()
        const spy = jest.spyOn(rProps, 'onChange')
        const wrapper = shallow(<Dictionary {...rProps} />)
        wrapper.find('Select').simulate('change', [props.values[0].value])
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })

    it('should render ReadOnlyField with single value', () => {
        const rProps = { ...props }
        rProps.readOnly = true
        const wrapper = shallow(<Dictionary {...rProps} />)
        expect(wrapper.find('Memo(ReadOnlyField)').findWhere(i => i.text() === rProps.value).length).toBeGreaterThan(0)
    })

    it('should render ReadOnlyField and pass onDrillDown prop', () => {
        const rProps = { ...props }
        rProps.readOnly = true
        rProps.onDrillDown = jest.fn()
        const wrapper = shallow(<Dictionary {...rProps} />)
        expect(wrapper.find('Memo(ReadOnlyField)').findWhere(i => i.prop('onDrillDown') === rProps.onDrillDown).length).toBeGreaterThan(0)
    })

    it('should render ReadOnlyField with empty value', () => {
        const rProps = { ...props }
        rProps.readOnly = true
        rProps.value = undefined
        const wrapper = shallow(<Dictionary {...rProps} />)
        expect(wrapper.find('Memo(ReadOnlyField)').findWhere(i => i.text().length === 0).length).toBeGreaterThan(0)
    })

    it('should render options from value', () => {
        const rProps = { ...props }
        rProps.values = []
        const wrapper = shallow(<Dictionary {...rProps} />)
        expect(wrapper.find('Select').findWhere(i => i.prop('value') === rProps.value).length).toEqual(1)
        expect(wrapper.find('Option').length).toEqual(1)
        expect(wrapper.find('Option').prop('title')).toEqual(rProps.value)
    })

    it('should render options from value (condition branch 1)', () => {
        const rProps = { ...props }
        rProps.values = null
        const wrapper = shallow(<Dictionary {...rProps} />)
        expect(wrapper.find('Select').findWhere(i => i.prop('value') === rProps.value).length).toEqual(1)
        expect(wrapper.find('Option').length).toEqual(1)
        expect(wrapper.find('Option').prop('title')).toEqual(rProps.value)
    })

    it('should render options from value (condition branch 2)', () => {
        const rProps = { ...props }
        rProps.values = []
        rProps.value = null
        const wrapper = shallow(<Dictionary {...rProps} />)
        expect(wrapper.find('Select').findWhere(i => i.prop('value') === rProps.value).length).toEqual(0)
        expect(wrapper.find('Option').length).toEqual(0)
    })

    it('should render placeholder', () => {
        const rProps = { ...props }
        rProps.values = []
        rProps.value = null
        rProps.placeholder = 'Choose one'
        const wrapper = mount(<Dictionary {...rProps} />)
        expect(wrapper.find('Select').findWhere(i => i.prop('value') === undefined).length).toBeGreaterThan(0)
        const placeholderDisplay = wrapper
            .find('div')
            .findWhere(i => i.hasClass('ant-select-selection__placeholder'))
            .get(0).props.style.display

        expect(placeholderDisplay).toEqual('block')
    })

    it('should not render placeholder', () => {
        const rProps = { ...props }
        rProps.values = []
        rProps.value = 'German'
        rProps.placeholder = 'Choose one'
        const wrapper = mount(<Dictionary {...rProps} />)
        expect(wrapper.find('Select').findWhere(i => i.prop('value') === undefined).length).toBeGreaterThan(0)
        const placeholderDisplay = wrapper
            .find('div')
            .findWhere(i => i.hasClass('ant-select-selection__placeholder'))
            .get(0).props.style.display

        expect(placeholderDisplay).toEqual('none')
    })
})

describe('Dictionary test in multiple mode', () => {
    const props: DictionaryProps = {
        ...baseFieldProps,
        value: [
            { value: 'Spanish', id: 'Spanish' },
            { value: 'German', id: 'German' }
        ],
        multiple: true,
        fieldName: defFieldName,
        values: defValues
    }

    it('should handle onChange', () => {
        const rProps = { ...props }
        rProps.onChange = jest.fn()
        const spy = jest.spyOn(rProps, 'onChange')
        const wrapper = shallow(<Dictionary {...rProps} />)
        wrapper.find('Select').simulate('change', [props.values[0].value])
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })

    it('should render ReadOnlyField with multiple value', () => {
        const rProps = { ...props }
        rProps.readOnly = true
        const result = (props.value as MultivalueSingleValue[]).map(i => i.value).join(', ')
        const wrapper = shallow(<Dictionary {...rProps} />)
        expect(wrapper.find('Memo(ReadOnlyField)').findWhere(i => i.text() === result).length).toBeGreaterThan(0)
    })

    it('should render options from value', () => {
        const rProps = { ...props }
        rProps.values = []
        rProps.value = [
            { value: 'Spanish', id: 'Spanish', options: { icon: 'sp' } },
            { value: 'German', id: 'German', options: { icon: 'ger' } }
        ]
        const wrapper = shallow(<Dictionary {...rProps} />)
        expect(wrapper.find('Option').length).toEqual(rProps.value.length)
        expect(wrapper.find('Icon').length).toEqual(rProps.value.length)
    })

    it('should render options from value (condition branch)', () => {
        const rProps = { ...props }
        rProps.values = null
        rProps.value = []
        const wrapper = shallow(<Dictionary {...rProps} />)
        expect(wrapper.find('Option').length).toEqual(0)
    })

    it('should render placeholder', () => {
        const rProps = { ...props }
        rProps.values = null
        rProps.value = []
        rProps.placeholder = 'Choose one'
        const wrapper = mount(<Dictionary {...rProps} />)
        const placeholderDisplay = wrapper
            .find('div')
            .findWhere(i => i.hasClass('ant-select-selection__placeholder'))
            .get(0).props.style.display
        expect(placeholderDisplay).toEqual('block')
    })

    it('should not render placeholder', () => {
        const rProps = { ...props }
        rProps.values = null
        rProps.value = [{ value: 'German', id: 'German' }]
        rProps.placeholder = 'Choose one'
        const wrapper = mount(<Dictionary {...rProps} />)
        const placeholderDisplay = wrapper
            .find('div')
            .findWhere(i => i.hasClass('ant-select-selection__placeholder'))
            .get(0).props.style.display
        expect(placeholderDisplay).toEqual('none')
    })
})

describe('getIconByParams test', () => {
    it('should return null', () => {
        expect(getIconByParams(null)).toEqual(null)
    })
    it('should return Icon', () => {
        const wrapper = shallow(<div>{getIconByParams('type')}</div>)
        expect(wrapper.find('Icon').findWhere(i => i.prop('type') === 'type').length).toEqual(1)
    })
    it('should get extraStyleClasses', () => {
        const wrapper = shallow(<div>{getIconByParams('type', 'className')}</div>)
        expect(wrapper.find('Icon').findWhere(i => i.props().className === 'className').length).toEqual(1)
    })
    it('should parse params', () => {
        const wrapper = shallow(<div>{getIconByParams('type red')}</div>)
        expect(wrapper.find('Icon').findWhere(i => i.props().style.color === 'red').length).toEqual(1)
    })
})

const baseFieldProps: BaseFieldProps = {
    widgetName: 'widget-example',
    cursor: null,
    meta: {
        type: FieldType.dictionary,
        key: 'field-example'
    }
}
