import React from 'react'
import { mount } from 'enzyme'
import View from '../View'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { Provider } from 'react-redux'
import { WidgetMeta, WidgetTypes } from '../../../interfaces/widget'
import { mockStore } from '../../../tests/mockStore'
import { DashboardLayout } from '../../index'
import DebugPanel from '../../DebugPanel/DebugPanel'
import ViewInfoLabel from '../../DebugPanel/components/ViewInfoLabel'

describe('View testing', () => {
    let store: Store<CoreStore> = null

    const widgets: WidgetMeta[] = [
        {
            name: 'name',
            bcName: 'bcName',
            type: WidgetTypes.List,
            title: 'title',
            position: 1,
            gridWidth: 2,
            fields: []
        },
        {
            name: 'popupName',
            bcName: 'bcName',
            type: WidgetTypes.PickListPopup,
            title: 'title',
            position: 1,
            gridWidth: 2,
            fields: []
        }
    ]
    beforeAll(() => {
        store = mockStore()
        store.getState().view.widgets = widgets
    })
    it('should render DashboardLayout', () => {
        const wrapper = mount(
            <Provider store={store}>
                <View />
            </Provider>
        )
        expect(wrapper.find(DashboardLayout).length).toBe(1)
    })

    it('should render custom layout', () => {
        const customLayout: React.FunctionComponent<{ props: any }> = props => {
            return <div>customLayout</div>
        }
        customLayout.displayName = 'customLayout'
        const wrapper = mount(
            <Provider store={store}>
                <View customLayout={customLayout} />
            </Provider>
        )
        expect(wrapper.find(customLayout).length).toBe(1)
        expect(wrapper.find(DashboardLayout).length).toBe(0)
    })

    it('should pass customSpinner', () => {
        const customSpinner: React.FunctionComponent<{ props: any }> = props => {
            return <div>customLayout</div>
        }
        customSpinner.displayName = 'customSpinner'
        const wrapper = mount(
            <Provider store={store}>
                <View customSpinner={customSpinner} />
            </Provider>
        )
        expect(wrapper.find(DashboardLayout).props().customSpinner === customSpinner).toBeTruthy()
    })

    it('should render developer info', () => {
        store.getState().session.debugMode = true
        const wrapper = mount(
            <Provider store={store}>
                <View />
            </Provider>
        )
        expect(wrapper.find(ViewInfoLabel).length).toBe(1)
        expect(wrapper.find(DebugPanel).length).toBe(widgets.length)
    })
})
