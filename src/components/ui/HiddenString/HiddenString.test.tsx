import React from 'react'
import {HiddenString} from './HiddenString'
import {shallow} from 'enzyme'

describe('HiddenString test', () => {

    it('should render full string', () => {
        const wrapper = shallow(<HiddenString inputString={'test'} showLength={0}/>)
        expect(wrapper.find('div').findWhere(i => i.text() === 'test').length).toBeGreaterThan(0)
    })

    it('should render cut string', () => {
        const wrapper = shallow(<HiddenString inputString={'test'} showLength={3}/>)
        expect(wrapper.find('div').findWhere(i => i.text() === 'tes').length).toBeGreaterThan(0)
    })
})
