import React from 'react'
import {mount} from 'enzyme'
import RadioButton from './RadioButton'

describe('RadioButton component test', () => {
    const values = [
        {value: 'testRadio-0'},
        {value: 'testRadio-1'},
        {value: 'testRadio-2'},
    ]

    it('component should render 3 values', () => {
        const wrapper = mount(
            <RadioButton
                value={'testRadio-2'}
                values={values}
            />
        )
        const radios = wrapper.find('input[type="radio"]')
        const checkedRadio = wrapper.find('input[type="radio"][checked=true]')

        expect(wrapper.find(RadioButton).length).toBe(1)
        expect(radios.length).toBe(3)
        expect(checkedRadio.getDOMNode().getAttribute('value')).toEqual('2')
    })

    it('values is correctly switched', () => {
        const onChange = jest.fn(() => {
            wrapper.setProps({ value: 'testRadio-1' })
        })
        const wrapper = mount(
            <RadioButton
                values={values}
                onChange={onChange}
            />
        )
        const radios = wrapper.find('input[type="radio"]')
        radios.at(1).simulate('change')
        expect(onChange.mock.calls.length).toBe(1)

        const checkedRadio = wrapper.find('input[type="radio"][checked=true]')

        expect(checkedRadio.getDOMNode().getAttribute('value')).toEqual('1')
    })

    it('values is null or undefined', () => {
        const wrapper = mount(
            <RadioButton
                values={null}
            />
        )
        expect(wrapper.find(RadioButton).length).toBe(1)
        expect(wrapper.find('input[type="radio"]').length).toBe(0)
    })
})
