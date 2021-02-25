import React from 'react'
import { shallow } from 'enzyme'
import WidgetInfoLabel from '../WidgetInfoLabel'

describe('WidgetInfoLabel', () => {
    it('should render', () => {
        const info = ['some info']
        const wrapper = shallow(<WidgetInfoLabel infoList={info} />)
        expect(wrapper.find('Memo(InfoLabel)').findWhere(i => i.props().label === 'Widget').length).toBe(1)
    })
})
