import React from 'react'
import { NavigationWidgetMeta } from '../../../interfaces/widget'
import { WidgetTypes } from '@tesler-ui/schema'
import { shallow } from 'enzyme'
import NavigationTabsWidget from './NavigationTabsWidget'
import NavigationTabs from '../../ui/NavigationTabs/NavigationTabs'

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

    it('should render as first level when `navigationLevel` option is missing', () => {
        let wrapper = shallow(<NavigationTabsWidget meta={{ ...meta, options: {} }} />)
        expect(wrapper.find(NavigationTabs).length).toBe(1)
        expect(wrapper.find(NavigationTabs).props().navigationLevel).toBe(1)
        wrapper = shallow(<NavigationTabsWidget meta={{ ...meta, options: undefined }} />)
        expect(wrapper.find(NavigationTabs).length).toBe(1)
        expect(wrapper.find(NavigationTabs).props().navigationLevel).toBe(1)
    })
})
