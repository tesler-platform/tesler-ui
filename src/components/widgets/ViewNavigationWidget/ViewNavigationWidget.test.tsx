import { shallow } from 'enzyme'
import React from 'react'
import ViewNavigationWidget from './ViewNavigationWidget'
import { NavigationWidgetMeta } from '../../../interfaces/widget'
import { WidgetTypes } from '@tesler-ui/schema'

describe('ViewNavigation testing', () => {
    const meta: NavigationWidgetMeta = {
        name: 'NavigationWidgetMeta',
        title: '',
        position: 0,
        gridWidth: 4,
        bcName: '',
        type: WidgetTypes.NavigationTabs,
        fields: [],
        options: {
            navigationLevel: 1
        }
    }

    it('should render', () => {
        const wrapper = shallow(<ViewNavigationWidget meta={meta} />)
        expect(wrapper.find('Memo(NavigationTabsWidget)').length).toBe(1)
    })
})
