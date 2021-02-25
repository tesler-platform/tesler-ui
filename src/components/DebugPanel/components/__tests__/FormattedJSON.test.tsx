import { shallow } from 'enzyme'
import React from 'react'
import FormattedJSON from '../FormattedJSON'

describe('FormattedJSON testing', () => {
    const ex = {
        name: 'name',
        bcName: 'exampleBcName',
        type: 'List',
        title: 'title',
        position: 1,
        gridWidth: 2,
        fields: [] as any
    }

    it('should render', () => {
        const wrapper = shallow(<FormattedJSON json={ex} />)
        expect(wrapper.find('code').length).toBe(1)
    })
})
