import React from 'react'
import { shallow } from 'enzyme'
import InfoLabel from '../InfoLabel'

describe('InfoLabel', () => {
    it('should render', () => {
        const info = ['some info']
        const label = 'Some label'
        const wrapper = shallow(<InfoLabel info={info} label={label} />)
        expect(wrapper.find('span').findWhere(i => i.text() === label).length).toBeGreaterThan(0)
        expect(wrapper.find('Memo(CopyableText)').length).toBe(info.length)
    })
})
