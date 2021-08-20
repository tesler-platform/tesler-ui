import React from 'react'
import PickListPopup from './PickListPopup'
import { FieldType } from '../../../interfaces/view'
import { mount } from 'enzyme'
import { WidgetTypes, WidgetTableMeta } from '../../../interfaces/widget'
import { Table, Spin } from 'antd'
import Pagination from '../../ui/Pagination/Pagination'
import { Store as CoreStore } from '../../../interfaces/store'
import { Store } from 'redux'
import { mockStore } from '../../../tests/mockStore'
import * as redux from 'react-redux'
import { Popup } from '../../ui/Popup/Popup'

describe('PickListPopup test', () => {
    let store: Store<CoreStore> = null
    beforeAll(() => {
        store = mockStore()
        store.getState().view.widgets = [widget]
    })

    it('should hide "hidden": true fields', () => {
        const wrapper = mount(
            <redux.Provider store={store}>
                <PickListPopup widget={widget} />
            </redux.Provider>
        )
        expect(wrapper.find(Table).length).toEqual(1)
        expect(wrapper.find(Table).props().columns.length).toEqual(1)
    })

    it('should render default title and footer', () => {
        const wrapper = mount(
            <redux.Provider store={store}>
                <PickListPopup widget={widget} />
            </redux.Provider>
        )
        expect(wrapper.find(Popup).props().title).toMatchSnapshot('popupTitle')
        expect(wrapper.find(Pagination).length).toEqual(1)
    })

    it('should render custom title, table and footer', () => {
        const customTitle = 'custom title'
        const customTableText = 'custom Table'
        const customTable = <p>{customTableText}</p>
        const customFooterText = 'custom Footer'
        const customFooter = <i>{customFooterText}</i>
        const wrapper = mount(
            <redux.Provider store={store}>
                <PickListPopup
                    widget={widget}
                    components={{
                        title: customTitle,
                        table: customTable,
                        footer: customFooter
                    }}
                />
            </redux.Provider>
        )
        expect(wrapper.find(Popup).props().title).toMatchSnapshot('customTitle')
        expect(wrapper.find(Popup).props().footer).toMatchSnapshot('customFooter')
        expect(wrapper.find(Popup).props().children).toMatchSnapshot('customTableText')
    })

    it('should render spinner when there are pending force-active requests', () => {
        store.getState().session.pendingRequests = [{ requestId: 'id', type: 'force-active' }]
        let wrapper = mount(
            <redux.Provider store={store}>
                <PickListPopup widget={widget} />
            </redux.Provider>
        )
        expect(wrapper.find(Spin).at(0).props().spinning).toBe(true)
        store.getState().session.pendingRequests = []
        wrapper = mount(
            <redux.Provider store={store}>
                <PickListPopup widget={widget} />
            </redux.Provider>
        )
        expect(wrapper.find(Spin).at(0).props().spinning).toBe(false)
    })
})

const widget: WidgetTableMeta = {
    name: 'UserPopup',
    title: 'Users',
    type: WidgetTypes.DataGrid as WidgetTypes.List | WidgetTypes.DataGrid,
    position: 1,
    bcName: 'bcName',
    gridWidth: 12,
    fields: [
        {
            title: 'First name',
            key: 'firstName',
            type: FieldType.input,
            hidden: true
        },
        {
            title: 'Last name',
            key: 'lastName',
            type: FieldType.input
        }
    ]
}
