/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import {mount} from 'enzyme'
import {FilterPopup} from './FilterPopup'
import {Store as CoreStore} from '../../interfaces/store'
import {Store} from 'redux'
import * as redux from 'react-redux'
import {Provider} from 'react-redux'
import {mockStore} from '../../tests/mockStore'
import {WidgetListField, WidgetMeta, WidgetTypes} from '../../interfaces/widget'
import {FieldType} from '../../interfaces/view'
import {Button, Form} from 'antd'
import {$do} from '../../actions/actions'
import {getFilterType} from '../../utils/filters'

describe('`<FilterPopup />`', () => {

    const useDispatch = jest.fn()
    jest.spyOn(redux, 'useDispatch').mockImplementation(() => {
        return useDispatch
    })

    let store: Store<CoreStore> = null
    const Content = () => <div>content</div>

    beforeEach(() => {
        store = mockStore()
        store.getState().view.widgets = [widget]
    })

    afterEach(() => {
        useDispatch.mockClear()
        delete store.getState().screen.filters.bcExample
    })

    it('renders two buttons and content', () => {
        const wrapper = mount(
            <Provider store={store}>
                <FilterPopup
                    widgetName="widget-example"
                    fieldKey="field-example"
                    value="empty"
                >
                    <Content />
                </FilterPopup>
            </Provider>
        )
        expect(wrapper.find(Content)).toHaveLength(1)
        expect(wrapper.findWhere(item => item.type() === Button && item.props().htmlType === 'submit')).toHaveLength(1)
        expect(wrapper.findWhere(item => item.type() === Button && item.props().htmlType !== 'submit')).toHaveLength(1)
    })

    it('returns null for missing widget or field', () => {
        const missingWidget = mount(
            <Provider store={store}>
                <FilterPopup
                    widgetName="widget-missing"
                    fieldKey="field-example"
                    value="empty"
                >
                    <Content />
                </FilterPopup>
            </Provider>
        )
        expect(missingWidget.find(FilterPopup).isEmptyRender()).toBe(true)
        const missingField = mount(
            <Provider store={store}>
                <FilterPopup
                    widgetName="widget-example"
                    fieldKey="field-missing"
                    value="empty"
                >
                    <Content />
                </FilterPopup>
            </Provider>
        )
        expect(missingField.find(FilterPopup).isEmptyRender()).toBe(true)
    })

    it('adds filter on apply click if value is set', () => {
        const onApply = jest.fn()
        const wrapper = mount(
            <Provider store={store}>
                <FilterPopup
                    widgetName="widget-example"
                    fieldKey="field-example"
                    value="someValue"
                    onApply={onApply}
                >
                    <Content />
                </FilterPopup>
            </Provider>
        )
        wrapper.find(Form).simulate('submit')
        expect(useDispatch.mock.calls[0][0]).toEqual(
            expect.objectContaining($do.bcAddFilter({
                bcName: 'bcExample',
                filter: expect.objectContaining(presetFilter)
            }))
        )
        expect(useDispatch.mock.calls[1][0]).toEqual(
            expect.objectContaining($do.bcForceUpdate({ bcName: 'bcExample' }))
        )
        expect(onApply).toBeCalled()
    })

    it('removes filter on apply click if value is empty', () => {
        store.getState().screen.filters.bcExample = [presetFilter]
        const onApply = jest.fn()
        const wrapper = mount(
            <Provider store={store}>
                <FilterPopup
                    widgetName="widget-example"
                    fieldKey="field-example"
                    value={null}
                    onApply={onApply}
                >
                    <Content />
                </FilterPopup>
            </Provider>
        )
        wrapper.find(Form).simulate('submit')
        expect(useDispatch.mock.calls[0][0]).toEqual(
            expect.objectContaining($do.bcRemoveFilter({
                bcName: 'bcExample',
                filter: presetFilter
            }))
        )
        expect(useDispatch.mock.calls[1][0]).toEqual(
            expect.objectContaining($do.bcForceUpdate({ bcName: 'bcExample' }))
        )
        expect(onApply).toBeCalled()
    })

    it('removes filter on cancel click if present', () => {
        store.getState().screen.filters.bcExample = [presetFilter]
        const onCancel = jest.fn()
        const wrapper = mount(
            <Provider store={store}>
                <FilterPopup
                    widgetName="widget-example"
                    fieldKey="field-example"
                    value="someValue"
                    onCancel={onCancel}
                >
                    <Content />
                </FilterPopup>
            </Provider>
        )
        wrapper.findWhere(item => item.type() === Button && item.props().htmlType !== 'submit').simulate('click')
        expect(useDispatch.mock.calls[0][0]).toEqual(
            expect.objectContaining($do.bcRemoveFilter({
                bcName: 'bcExample',
                filter: expect.objectContaining(presetFilter)
            }))
        )
        expect(useDispatch.mock.calls[1][0]).toEqual(
            expect.objectContaining($do.bcForceUpdate({ bcName: 'bcExample' }))
        )
        expect(onCancel).toBeCalled()
    })

    it('does not dispatch anything on cancel click if no filter set', () => {
        expect(useDispatch).toBeCalledTimes(0)
        const onCancel = jest.fn()
        const wrapper = mount(
            <Provider store={store}>
                <FilterPopup
                    widgetName="widget-example"
                    fieldKey="field-example"
                    value={null}
                    onCancel={onCancel}
                >
                    <Content />
                </FilterPopup>
            </Provider>
        )
        wrapper.findWhere(item => item.type() === Button && item.props().htmlType !== 'submit').simulate('click')
        expect(useDispatch).toBeCalledTimes(0)
        expect(onCancel).toBeCalled()
    })

    it('handles missing `onApply` and `onCancel`', () => {
        store.getState().screen.filters.bcExample = [presetFilter]
        const wrapper = mount(
            <Provider store={store}>
                <FilterPopup
                    widgetName="widget-example"
                    fieldKey="field-example"
                    value={null}
                >
                    <Content />
                </FilterPopup>
            </Provider>
        )
        wrapper.find(Form).simulate('submit')
        wrapper.findWhere(item => item.type() === Button && item.props().htmlType !== 'submit').simulate('click')
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

const presetFilter = {
    fieldName: 'field-example',
    type: getFilterType(widgetFieldMeta.type),
    value: 'someValue'
}
