import React from 'react'
import { NavigationWidgetMeta } from '../../../interfaces/widget'
import { WidgetTypes } from '@tesler-ui/schema'
import { shallow } from 'enzyme'
import NavigationTabsWidget from './NavigationTabsWidget'

describe('NavigationTabsWidget test', () => {
    const meta: NavigationWidgetMeta = {
        name: 'NavigationWidgetMeta',
        title: '',
        position: 0,
        gridWidth: 4,
        bcName: '',
        type: WidgetTypes.NavigationTabs,
        fields: [],
        options: {
            navigationLevel: 2
        }
    }

    it('should render', () => {
        const wrapper = shallow(<NavigationTabsWidget meta={meta} />)
        expect(wrapper.find('Memo(NavigationTabs)').findWhere(i => i.props().navigationLevel === 2).length).toBe(1)
    })

    it('should not render', () => {
        const noNavigationLvlMeta = { ...meta, options: {} }
        const wrapper = shallow(<NavigationTabsWidget meta={noNavigationLvlMeta} />)
        expect(wrapper.find('Memo(NavigationTabs)').length).toBe(0)
        expect(wrapper.isEmptyRender()).toBeTruthy()
    })
})
