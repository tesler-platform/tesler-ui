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
import {FlatTree} from '../FlatTree'
import {mount} from 'enzyme'
import {Store} from 'redux'
import {Provider} from 'react-redux'
import {Store as CoreStore} from '../../../../interfaces/store'
import {mockStore} from '../../../../tests/mockStore'
import {WidgetTableMeta, WidgetTypes} from '../../../../interfaces/widget'
import {FieldType} from '../../../../interfaces/view'
import {TreeVirtualized, TreeVirtualizedProps} from '../../../ui/TreeVirtualized/TreeVirtualized'
import {DataItemNode} from '../../../../interfaces/tree'
import {RowMeta} from '../../../../interfaces/rowMeta'
import {FilterType} from '../../../../interfaces/filters'

describe('<FlatTree />', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.bo.bc.bcExample = bcExample
        store.getState().view.rowMeta.bcExample = rowMeta
        store.getState().data.bcExample = [{ id: '1', name: 'one', vstamp: 0 }]
        store.getState().view.widgets = [widget]
    })

    afterEach(() => {
        store.getState().screen.bo.bc.bcExample = bcExample
        store.getState().view.rowMeta.bcExample = rowMeta
    })

    it('passes dimensions', () => {
        const wrapper = mount(
            <Provider store={store}>
                <FlatTree
                    meta={widget}
                    width={640}
                    height={480}
                    itemSize={45}
                />
            </Provider>
        )
        expect(wrapper.find(TreeVirtualized).length).toBe(1)
        expect((wrapper.find(TreeVirtualized).props() as TreeVirtualizedProps<DataItemNode>).width).toBe(640)
        expect((wrapper.find(TreeVirtualized).props() as TreeVirtualizedProps<DataItemNode>).height).toBe(480)
        expect((wrapper.find(TreeVirtualized).props() as TreeVirtualizedProps<DataItemNode>).itemSize).toBe(45)
    })

    it('passes filters', () => {
        store.getState().screen.filters.bcExample = [{ value: 'one', fieldName: 'name', type: FilterType.contains }]
        const wrapper = mount(
            <Provider store={store}>
                <FlatTree
                    meta={widget}
                />
            </Provider>
        )
        expect(wrapper.find(TreeVirtualized).length).toBe(1)
        const filters = (wrapper.find(TreeVirtualized).props() as TreeVirtualizedProps<DataItemNode>).filters
        expect(filters.length).toBe(1)
        expect(filters[0].value).toBe('one')
    })

    it('passes empty data when bc data or row meta in progress', () => {
        store.getState().screen.bo.bc.bcExample.loading = true
        let wrapper = mount(
            <Provider store={store}>
                <FlatTree
                    meta={widget}
                />
            </Provider>
        )
        expect((wrapper.find(TreeVirtualized).props() as TreeVirtualizedProps<DataItemNode>).items.length).toBe(0)
        store.getState().screen.bo.bc.bcExample.loading = false
        wrapper = mount(
            <Provider store={store}>
                <FlatTree
                    meta={widget}
                />
            </Provider>
        )
        expect((wrapper.find(TreeVirtualized).props() as TreeVirtualizedProps<DataItemNode>).items.length).toBe(1)
    })

    it('does not crash for missing bc or field', () => {
        store.getState().screen.filters.missingBc = [{ value: 'one', fieldName: 'name', type: FilterType.contains }]
        const wrapper = mount(
            <Provider store={store}>
                <FlatTree
                    meta={{
                        ...widget,
                        bcName: 'missingBc',
                        fields: [{
                            key: 'missingField',
                            title: 'Test Column',
                            type: FieldType.hidden
                        }]
                    }}
                />
            </Provider>
        )
        expect(wrapper.find(TreeVirtualized).length).toBe(1)
    })
})

const widget: WidgetTableMeta = {
    name: 'widget-example',
    type: WidgetTypes.FlatTree,
    title: null,
    bcName: 'bcExample',
    position: 1,
    gridWidth: null,
    fields: [{
        key: 'name',
        title: 'Test Column',
        type: FieldType.input
    }]
}

const bcExample = {
    name: 'bcExample',
    parentName: null as string,
    url: '',
    cursor: null as string,
    loading: false
}

const rowMeta: Record<string, RowMeta> = {
    bcExample: {
        actions: [],
        fields: [{ key: 'name', currentValue: null }]
    }
}
