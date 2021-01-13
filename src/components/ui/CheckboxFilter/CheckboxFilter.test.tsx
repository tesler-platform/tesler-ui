import React from 'react'
import CheckboxFilter from './CheckboxFilter'
import { shallow, mount } from 'enzyme'
import { Checkbox } from 'antd'

describe('`<CheckboxFilter /> header`', () => {
    it('renders indeterminate state', () => {
        const wrapper = mount(<CheckboxFilter title="Field Name" value={[]} filterValues={filterValues} />)
        expect(wrapper.find(Checkbox).at(0).props().indeterminate).toBeFalsy()
        wrapper.setProps({ value: ['one'] })
        expect(wrapper.find(Checkbox).at(0).props().indeterminate).toBeTruthy()
        wrapper.setProps({ value: ['one', 'two', 'three'] })
        expect(wrapper.find(Checkbox).at(0).props().indeterminate).toBeFalsy()
        wrapper.setProps({ value: null })
        expect(wrapper.find(Checkbox).at(0).props().indeterminate).toBeFalsy()
    })
    it('renders title', () => {
        const title = 'Field Name'
        const wrapper = shallow(<CheckboxFilter title={title} value={[]} filterValues={filterValues} />)
        expect(wrapper.find('li').at(0).text().includes(title)).toBeTruthy()
    })
    it('fires `onChange` with all values when clicked and unchecked', () => {
        const emptyOnChange = jest.fn()
        const emptyWrapper = shallow(<CheckboxFilter title="Field Name" value={[]} filterValues={filterValues} onChange={emptyOnChange} />)
        emptyWrapper
            .find(Checkbox)
            .at(0)
            .simulate('change', { target: { checked: true } })
        expect(emptyOnChange).toBeCalledWith(expect.arrayContaining(['one', 'two', 'three']))
        const partialOnChange = jest.fn()
        const partialWrapper = shallow(
            <CheckboxFilter title="Field Name" value={['one', 'three']} filterValues={filterValues} onChange={partialOnChange} />
        )
        partialWrapper
            .find(Checkbox)
            .at(0)
            .simulate('change', { target: { checked: true } })
        expect(partialOnChange).toBeCalledWith(expect.arrayContaining(['one', 'two', 'three']))
    })

    it('fires `onChange` with null when clicked and checked', () => {
        const onChange = jest.fn()
        const wrapper = shallow(
            <CheckboxFilter title="Field Name" value={['one', 'two', 'three']} filterValues={filterValues} onChange={onChange} />
        )
        wrapper
            .find(Checkbox)
            .at(0)
            .simulate('change', { target: { checked: false } })
        expect(onChange).toBeCalledWith(null)
    })
})

describe('`<CheckboxFilter /> list`', () => {
    it('renders `Checkbox` and title for each item', () => {
        const wrapper = shallow(
            <CheckboxFilter title="Field Name" value={[filterValues[1].value]} filterValues={filterValues} onChange={jest.fn()} />
        )
        expect(wrapper.find('ul').find('li')).toHaveLength(filterValues.length)
        expect(
            wrapper
                .find('ul')
                .find('li')
                .map(item => item)
                .every((item, index) => {
                    expect(item.text().includes(filterValues[index].value)).toBeTruthy()
                })
        )
        expect(wrapper.find('ul').find(Checkbox).at(0).props().checked).toBeFalsy()
        expect(wrapper.find('ul').find(Checkbox).at(1).props().checked).toBeTruthy()
        expect(wrapper.find('ul').find(Checkbox).at(2).props().checked).toBeFalsy()
    })

    it('fires `onChange` with checked value', () => {
        const onChange = jest.fn()
        const wrapper = shallow(
            <CheckboxFilter title="Field Name" value={[filterValues[1].value]} filterValues={filterValues} onChange={onChange} />
        )
        wrapper
            .find('ul')
            .find(Checkbox)
            .at(0)
            .simulate('change', { target: { value: filterValues[0].value, checked: true } })
        expect(onChange).toBeCalledWith(expect.arrayContaining([filterValues[1].value, filterValues[0].value]))
    })

    it('fires `onChange` without checked value', () => {
        const onChange = jest.fn()
        const wrapper = shallow(
            <CheckboxFilter
                title="Field Name"
                value={[filterValues[1].value, filterValues[2].value]}
                filterValues={filterValues}
                onChange={onChange}
            />
        )
        wrapper
            .find('ul')
            .find(Checkbox)
            .at(0)
            .simulate('change', { target: { value: filterValues[2].value, checked: false } })
        expect(onChange).toBeCalledWith(expect.arrayContaining([filterValues[1].value, filterValues[1].value]))
        onChange.mockClear()
        wrapper.setProps({ value: [filterValues[1].value] })
        wrapper
            .find('ul')
            .find(Checkbox)
            .at(0)
            .simulate('change', { target: { value: filterValues[1].value, checked: false } })
        expect(onChange).toBeCalledWith(null)
    })

    it('handles empty value', () => {
        const onChange = jest.fn()
        const wrapper = shallow(<CheckboxFilter title="Field Name" value={null} filterValues={filterValues} onChange={onChange} />)
        wrapper
            .find('ul')
            .find(Checkbox)
            .at(0)
            .simulate('change', { target: { value: filterValues[2].value, checked: true } })
        expect(onChange).toBeCalledWith(expect.arrayContaining([filterValues[2].value]))
        onChange.mockClear()
        wrapper
            .find(Checkbox)
            .at(0)
            .simulate('change', { target: { checked: true } })
        expect(onChange).toBeCalledWith(expect.arrayContaining(filterValues.map(item => item.value)))
    })

    it('handles missing onChange', () => {
        const wrapper = shallow(<CheckboxFilter title="Field Name" value={null} filterValues={filterValues} />)
        wrapper
            .find('ul')
            .find(Checkbox)
            .at(0)
            .simulate('change', { target: { value: filterValues[2].value, checked: true } })
        wrapper
            .find(Checkbox)
            .at(0)
            .simulate('change', { target: { checked: true } })
    })
})

const filterValues = [{ value: 'one' }, { value: 'two' }, { value: 'three' }]
