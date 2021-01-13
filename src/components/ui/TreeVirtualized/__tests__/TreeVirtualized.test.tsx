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
import { mount } from 'enzyme'
import { TreeVirtualized, TreeVirtualizedDomContainer } from '../TreeVirtualized'
import { TreeVirtualizedNode, TreeVirtualizedNodeProps } from '../TreeVirtualizedNode'
import { act } from 'react-dom/test-utils'
import { FilterType } from '../../../../interfaces/filters'
import { FieldType } from '../../../../interfaces/view'
import { Store as CoreStore } from '../../../../interfaces/store'
import { Store } from 'redux'
import { mockStore } from '../../../../tests/mockStore'
import { Provider } from 'react-redux'

describe('<TreeVirtualized />', () => {
    const sample = getTreeSample()
    let store: Store<CoreStore> = null
    beforeAll(() => {
        store = mockStore()
    })

    it('respects `matchCase` option when searching', () => {
        let wrapper = mount(
            <Provider store={store}>
                <TreeVirtualized<typeof sample[number]>
                    items={sample}
                    width={640}
                    height={480}
                    itemSize={45}
                    filters={[{ fieldName: 'name', value: 'lucky', type: FilterType.contains }]}
                    fields={[{ key: 'name', title: '', type: FieldType.input }]}
                    onSelect={jest.fn}
                />
            </Provider>
        )
        expect(wrapper.find(TreeVirtualizedNode).length).toBe(6)
        expect(wrapper.find(TreeVirtualizedNode).at(0).text()).toBe('two')
        expect(wrapper.find(TreeVirtualizedNode).at(1).text()).toBe('ten')
        expect(wrapper.find(TreeVirtualizedNode).at(2).text()).toBe('')
        expect(wrapper.find(TreeVirtualizedNode).at(3).text()).toBe('Lucky Twelve')
        expect(wrapper.find(TreeVirtualizedNode).at(4).text()).toBe('three')
        expect(wrapper.find(TreeVirtualizedNode).at(5).text()).toBe('lucky Eight')
        wrapper = mount(
            <Provider store={store}>
                <TreeVirtualized<typeof sample[number]>
                    matchCase={true}
                    items={sample}
                    width={640}
                    height={480}
                    itemSize={45}
                    filters={[{ fieldName: 'name', value: 'lucky', type: FilterType.contains }]}
                    fields={[{ key: 'name', title: '', type: FieldType.input }]}
                    onSelect={jest.fn}
                />
            </Provider>
        )
        expect(wrapper.find(TreeVirtualizedNode).length).toBe(2)
        expect(wrapper.find(TreeVirtualizedNode).at(0).text()).toBe('three')
        expect(wrapper.find(TreeVirtualizedNode).at(1).text()).toBe('lucky Eight')
    })

    it('expands node or collapse node and all descendants on toggle', () => {
        const wrapper = mount(
            <Provider store={store}>
                <TreeVirtualized<typeof sample[number]>
                    items={sample}
                    width={640}
                    height={480}
                    itemSize={45}
                    fields={[{ key: 'name', title: '', type: FieldType.input }]}
                    onSelect={jest.fn}
                />
            </Provider>
        )
        // initial
        expect(wrapper.find(TreeVirtualizedNode).length).toBe(3)
        expect(wrapper.find(TreeVirtualizedNode).at(0).text()).toBe('one')
        expect(wrapper.find(TreeVirtualizedNode).at(1).text()).toBe('two')
        expect(wrapper.find(TreeVirtualizedNode).at(2).text()).toBe('three')
        // open node `two`
        let props = wrapper.find(TreeVirtualizedNode).at(1).props() as TreeVirtualizedNodeProps<typeof sample[number]>
        act(() => {
            props.data.onToggle('2')
        })
        wrapper.update()
        expect(wrapper.find(TreeVirtualizedNode).length).toBe(5)
        expect(wrapper.find(TreeVirtualizedNode).at(0).text()).toBe('one')
        expect(wrapper.find(TreeVirtualizedNode).at(1).text()).toBe('two')
        expect(wrapper.find(TreeVirtualizedNode).at(2).text()).toBe('nine')
        expect(wrapper.find(TreeVirtualizedNode).at(3).text()).toBe('ten')
        expect(wrapper.find(TreeVirtualizedNode).at(4).text()).toBe('three')
        // close node `two`
        props = wrapper.find(TreeVirtualizedNode).at(1).props() as TreeVirtualizedNodeProps<typeof sample[number]>
        act(() => {
            props.data.onToggle('2')
        })
        wrapper.update()
        expect(wrapper.find(TreeVirtualizedNode).length).toBe(3)
        expect(wrapper.find(TreeVirtualizedNode).at(0).text()).toBe('one')
        expect(wrapper.find(TreeVirtualizedNode).at(1).text()).toBe('two')
        expect(wrapper.find(TreeVirtualizedNode).at(2).text()).toBe('three')
    })

    it('provides `scrollToIndex` and `scrollToItem` helpers for Selenium tests', () => {
        const largeSample = new Array(200).fill(null).map((item, index) => {
            return { id: index.toString(), parentId: '0', level: 1 }
        })
        const wrapper = mount(
            <Provider store={store}>
                <TreeVirtualized<typeof largeSample[number]>
                    items={largeSample}
                    width={640}
                    height={480}
                    itemSize={45}
                    fields={[{ key: 'name', title: '', type: FieldType.input }]}
                    onSelect={jest.fn}
                />
            </Provider>
        )
        const container = wrapper.getDOMNode<TreeVirtualizedDomContainer>()
        container.scrollToItem('50', 'id', 'start')
        wrapper.update()
        expect((wrapper.find(TreeVirtualizedNode).at(0).props() as any).index).toBe(48)
    })
})

function getTreeSample() {
    const tree = [
        { id: '1', name: 'one', parentId: '0', level: 1 },
        { id: '11', name: 'four', parentId: '1', level: 2 },
        { id: '12', name: 'five', parentId: '1', level: 2 },
        { id: '13', name: 'six', parentId: '1', level: 2 },
        { id: '2', name: 'two', parentId: '0', level: 1 },
        { id: '21', name: 'nine', parentId: '2', level: 2 },
        { id: '22', name: 'ten', parentId: '2', level: 2 },
        { id: '221', name: null, parentId: '22', level: 3 },
        { id: '2211', name: 'Lucky Twelve', parentId: '221', level: 4 },
        { id: '3', name: 'three', parentId: '0', level: 1 },
        { id: '31', name: 'seven', parentId: '3', level: 2 },
        { id: '32', name: 'lucky Eight', parentId: '3', level: 2 }
    ]
    return tree
}
