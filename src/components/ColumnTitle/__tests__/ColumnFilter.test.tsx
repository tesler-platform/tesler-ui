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
import {Store} from 'redux'
import {mount} from 'enzyme'
import {Popover} from 'antd'
import * as redux from 'react-redux'
import {Store as CoreStore} from '../../../interfaces/store'
import {mockStore} from '../../../tests/mockStore'
import ColumnFilter from '../ColumnFilter'
import {FieldType} from '../../../interfaces/view'
import {WidgetListField, WidgetMeta, WidgetTypes} from '../../../interfaces/widget'
import {RowMetaField} from '../../../interfaces/rowMeta'
import FilterPopup from '../../FilterPopup/FilterPopup'
import {types as coreActions, $do} from '../../../actions/actions'
import {FilterType, BcFilter} from '../../../interfaces/filters'

const useDispatch = jest.fn()
jest.spyOn(redux, 'useDispatch').mockImplementation(() => {
    return useDispatch
})

describe('`<ColumnFilter />`', () => {
    let store: Store<CoreStore> = null
    beforeAll(() => {
        store = mockStore()
        store.getState().view.widgets = [widget]
    })

    it('renders Popover with custom or default content', () => {
        const content = <redux.Provider store={store}>
            <ColumnFilter
                widgetMeta={widgetFieldMeta}
                widgetName="widget-name"
                rowMeta={fieldRowMeta}
            />)
        </redux.Provider>
        expect(mount(content).find(Popover)).toHaveLength(1)
    })

    it('opens/closes popup when clicked', () => {
        const content = <redux.Provider store={store}>
            <ColumnFilter
                widgetMeta={widgetFieldMeta}
                widgetName="widget-name"
                rowMeta={fieldRowMeta}
            />)
        </redux.Provider>
        const wrapper = mount(content)
        expect(wrapper.find(FilterPopup)).toHaveLength(0)
        // open
        wrapper.find(Popover).childAt(0).simulate('click')
        expect(wrapper.find(FilterPopup)).toHaveLength(1)
        expect(wrapper.find(Popover).props().visible).toBeTruthy()
        // close (`destroyTooltipOnHide` was internal at the moment of writing)
        wrapper.find(Popover).childAt(0).simulate('click')
        expect(wrapper.find(Popover).props().visible).toBeFalsy()
    })

    it('closes popup on apply and cancel buttons', () => {
        const content = <redux.Provider store={store}>
            <ColumnFilter
                widgetMeta={{ ...widgetFieldMeta, type: FieldType.date }}
                widgetName="widget-name"
                rowMeta={fieldRowMeta}
            />)
        </redux.Provider>
        const wrapper = mount(content)
        wrapper.find(Popover).childAt(0).simulate('click')
        expect(wrapper.find(Popover).props().visible).toBeTruthy()
        wrapper.find(FilterPopup).invoke('onApply')()
        wrapper.update()
        expect(wrapper.find(Popover).props().visible).toBeFalsy()
        wrapper.find(Popover).childAt(0).simulate('click')
        expect(wrapper.find(Popover).props().visible).toBeTruthy()
        wrapper.find(FilterPopup).invoke('onCancel')()
        expect(wrapper.find(Popover).props().visible).toBeFalsy()
    })

    it('supports custom popover', () => {
        const CustomPopup = () => <div>I'm a custom popup</div>
        const content = <redux.Provider store={store}>
            <ColumnFilter
                widgetMeta={widgetFieldMeta}
                widgetName="widget-name"
                rowMeta={fieldRowMeta}
                components={{ popup: <CustomPopup /> }}
            />)
        </redux.Provider>
        const wrapper = mount(content)
        expect(wrapper.find(FilterPopup)).toHaveLength(0)
        expect(wrapper.find(CustomPopup)).toHaveLength(0)
        // open
        wrapper.find(Popover).childAt(0).simulate('click')
        expect(wrapper.find(FilterPopup)).toHaveLength(0)
        expect(wrapper.find(CustomPopup)).toHaveLength(1)
    })

    it('multivalue fields dispatch `showViewPopup` action instead of showing popup', () => {
        const content = <redux.Provider store={store}>
            <ColumnFilter
                widgetMeta={{ ...widgetFieldMeta, type: FieldType.multivalue }}
                widgetName="widget-name"
                rowMeta={fieldRowMeta}
            />)
        </redux.Provider>
        const wrapper = mount(content)
        wrapper.find(Popover).childAt(0).simulate('click')
        expect(useDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: coreActions.showViewPopup }))
    })

    it('updates value with filter change in store', () => {
        const content = <redux.Provider store={store}>
            <ColumnFilter
                widgetMeta={widgetFieldMeta}
                widgetName="widget-name"
                rowMeta={fieldRowMeta}
            />)
        </redux.Provider>
        const wrapper = mount(content)
        store.dispatch($do.bcAddFilter({ bcName: 'bcExample', filter: presetFilter }))
        wrapper.update()
        wrapper.find(Popover).childAt(0).simulate('click')
        expect(wrapper.find(FilterPopup).props().value).toBe(presetFilter.value)
    })

})

const widgetFieldMeta: WidgetListField = {
    key: 'key',
    title: 'Test Column',
    type: FieldType.input
}

const widget: WidgetMeta = {
    name: 'widget-name',
    type: WidgetTypes.List,
    title: null,
    bcName: 'bcExample',
    position: 1,
    gridWidth: null,
    fields: [widgetFieldMeta]
}

const fieldRowMeta: RowMetaField = {
    key: 'key',
    currentValue: null
}

const presetFilter: BcFilter = {
    type: FilterType.contains,
    value: 'test',
    fieldName: 'key'
}
