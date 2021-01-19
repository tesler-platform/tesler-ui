import React from 'react'
import { shallow } from 'enzyme'
import { DashboardLayout } from '../DashboardLayout'
import { WidgetMeta, WidgetTypes } from '../../../../interfaces/widget'
import { Widget } from '../../../index'

describe('DashboardLayout testing', () => {
    const widgets: WidgetMeta[] = [
        {
            name: 'name',
            bcName: 'bcName',
            type: WidgetTypes.List,
            title: 'title',
            position: 1,
            gridWidth: 2,
            fields: []
        }
    ]

    it('should render widgets', () => {
        const wrapper = shallow(<DashboardLayout widgets={widgets} />)
        expect(wrapper.find(Widget).length).toBe(widgets.length)
    })

    it('should pass customSpinner', () => {
        const customSpinner: React.FunctionComponent<{ props: any }> = props => {
            return <div>customLayout</div>
        }
        customSpinner.displayName = 'customSpinner'
        const wrapper = shallow(<DashboardLayout widgets={widgets} customSpinner={customSpinner} />)
        expect(wrapper.find(Widget).props().customSpinner === customSpinner).toBeTruthy()
    })
})
