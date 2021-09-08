import { shallow } from 'enzyme'
import React from 'react'
import ViewNavigationWidget from './ViewNavigationWidget'

describe('ViewNavigation testing', () => {
    it('should render', () => {
        const wrapper = shallow(<ViewNavigationWidget />)
        expect(wrapper.find('Memo(NavigationTabs)').length).toBe(1)
    })
})
