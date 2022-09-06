import React from 'react'
import * as redux from 'react-redux'
import { mount } from 'enzyme'
import ColumnSort from '../ColumnSort'
import { Icon } from 'antd'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { WidgetListField, WidgetMeta, WidgetTypes } from '../../../interfaces/widget'
import { FieldType } from '../../../interfaces/view'
import { $do } from '../../../actions/actions'

describe('`<ColumnSort />`', () => {
    let store: Store<CoreStore> = null
    beforeAll(() => {
        store = mockStore()
        store.getState().view.widgets = [widget]
    })

    it('renders icon corresponding to the preset sort direction', () => {
        store.getState().screen.sorters.bcExample = [{ fieldName: 'field-example', direction: 'asc' }]
        const presetAsc = mount(
            <redux.Provider store={store}>
                <ColumnSort widgetName="widget-example" fieldKey="field-example" />
            </redux.Provider>
        )
        expect(presetAsc.find(Icon).props().type).toBe('caret-up')
        store.getState().screen.sorters.bcExample = [{ fieldName: 'field-example', direction: 'desc' }]
        const presetDesc = mount(
            <redux.Provider store={store}>
                <ColumnSort widgetName="widget-example" fieldKey="field-example" />
            </redux.Provider>
        )
        expect(presetDesc.find(Icon).props().type).toBe('caret-down')
    })
    it('renders `caret-down` icon without preset sorter', () => {
        const dispatch = jest.fn()
        const mock = jest.spyOn(store, 'dispatch').mockImplementation(action => {
            return dispatch(action)
        })
        const wrapper = mount(
            <redux.Provider store={store}>
                <ColumnSort widgetName="widget-example" fieldKey="field-missing" />
            </redux.Provider>
        )
        expect(wrapper.find(Icon).props().type).toBe('caret-down')
        wrapper.find(Icon).simulate('click')
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining(
                $do.bcAddSorter({
                    bcName: 'bcExample',
                    sorter: { direction: 'desc', fieldName: 'field-missing' }
                })
            )
        )
        mock.mockRestore()
    })
    it('dispatches `bcAddSorter` action on click', () => {
        const dispatch = jest.fn()
        const mock = jest.spyOn(store, 'dispatch').mockImplementation(action => {
            return dispatch(action)
        })
        const wrapper = mount(
            <redux.Provider store={store}>
                <ColumnSort widgetName="widget-example" fieldKey="field-example" />
            </redux.Provider>
        )
        expect(dispatch).toHaveBeenCalledTimes(0)
        wrapper.find(Icon).simulate('click')
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining(
                $do.bcAddSorter({
                    bcName: 'bcExample',
                    sorter: { direction: 'asc', fieldName: 'field-example' }
                })
            )
        )
        mock.mockRestore()
    })

    xit('changes icon after click', () => {
        const wrapper = mount(
            <redux.Provider store={store}>
                <ColumnSort widgetName="widget-example" fieldKey="field-example" />
            </redux.Provider>
        )
        expect(wrapper.find(Icon).props().type).toBe('caret-down')
        wrapper.find(Icon).simulate('click')
        expect(wrapper.find(Icon).props().type).toBe('caret-up')
    })

    it('dispatches `bcFetchDataPages` action for infinite pagination', () => {
        const dispatch = jest.fn()
        const mock = jest.spyOn(store, 'dispatch').mockImplementation(action => {
            return dispatch(action)
        })
        store.getState().view.infiniteWidgets = ['widget-example']
        store.getState().screen.bo.bc.bcExample = { page: 4 } as any
        const wrapper = mount(
            <redux.Provider store={store}>
                <ColumnSort widgetName="widget-example" fieldKey="field-example" />
            </redux.Provider>
        )
        expect(dispatch).toHaveBeenCalledTimes(0)
        wrapper.find(Icon).simulate('click')
        expect(dispatch).toHaveBeenCalledTimes(2)
        dispatch.mock.calls[1] = expect.objectContaining(
            $do.bcFetchDataPages({
                bcName: 'bcExample',
                widgetName: 'widget-examle',
                from: 1,
                to: 4
            })
        )
        mock.mockRestore()
    })

    it('dispatches `bcForceUpdate` action for regular pagination', () => {
        const dispatch = jest.fn()
        const mock = jest.spyOn(store, 'dispatch').mockImplementation(action => {
            return dispatch(action)
        })
        store.getState().view.infiniteWidgets = ['widget-example']
        store.getState().screen.bo.bc.bcExample = { page: 4 } as any
        const wrapper = mount(
            <redux.Provider store={store}>
                <ColumnSort widgetName="widget-example" fieldKey="field-example" />
            </redux.Provider>
        )
        expect(dispatch).toHaveBeenCalledTimes(0)
        wrapper.find(Icon).simulate('click')
        expect(dispatch).toHaveBeenCalledTimes(2)
        dispatch.mock.calls[1] = expect.objectContaining(
            $do.bcForceUpdate({
                bcName: 'bcExample',
                widgetName: 'widget-examle'
            })
        )
        mock.mockRestore()
    })

    it('renders null when widget is missing', () => {
        const wrapper = mount(
            <redux.Provider store={store}>
                <ColumnSort widgetName="widget-missing" fieldKey="field-example" />
            </redux.Provider>
        )
        expect(wrapper.find(ColumnSort).type === null)
    })

    it('handles stores without `infiniteWidgets`', () => {
        delete store.getState().view.infiniteWidgets
        const wrapper = mount(
            <redux.Provider store={store}>
                <ColumnSort widgetName="widget-example" fieldKey="field-example" />
            </redux.Provider>
        )
        expect(wrapper.find(Icon))
    })
})

const widgetFieldMeta: WidgetListField = {
    key: 'field-example',
    title: 'Test Column',
    type: FieldType.input
}

const widget: WidgetMeta = {
    name: 'widget-example',
    type: WidgetTypes.List,
    title: null,
    bcName: 'bcExample',
    position: 1,
    gridWidth: null,
    fields: [widgetFieldMeta]
}
