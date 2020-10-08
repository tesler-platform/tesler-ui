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
import {TreeVirtualizedNode, TreeVirtualizedNodeData} from '../TreeVirtualizedNode'
import {assignTreeLinks} from '../../../../utils/tree'
import styles from '../TreeVirtualizedNode.less'
import {TreeNodeBidirectional} from '../../../../interfaces/tree'
import {Icon} from 'antd'
import SearchHightlight from '../../SearchHightlight/SearchHightlight'
import {FilterType} from '../../../../interfaces/filters'
import {FieldType} from '../../../../interfaces/view'
import {Store as CoreStore} from '../../../../interfaces/store'
import {Store} from 'redux'
import {mockStore} from '../../../../tests/mockStore'
import {Provider} from 'react-redux'

type TestDataItem = {
    id: string,
    name: string,
    parent: TreeNodeBidirectional,
    parentId: string
}

describe('<TreeVirtualizedNode />', () => {
    let store: Store<CoreStore> = null
    beforeAll(() => {
        store = mockStore()
    })
    const items = getTreeSample()
    const itemData: TreeVirtualizedNodeData<TestDataItem> = {
        items,
        fields: [{ key: 'name', title: '', type: FieldType.input }],
        onToggle: null,
        filters: null,
        expandedItems: null
    }

    it('renders expand button for nodes with chilren', () => {
        let wrapper = mount(<Provider store={store}>
            <TreeVirtualizedNode index={0} style={null} data={itemData} />
        </Provider>
        )
        expect(wrapper.find('button').find(Icon).props().type).toBe('plus-square')
        wrapper = mount(<Provider store={store}>
            <TreeVirtualizedNode index={0} style={null} data={{ ...itemData, expandedItems: ['1'] }} />
        </Provider>
        )
        expect(wrapper.find('button').find(Icon).props().type).toBe('minus-square')
        wrapper = mount(<Provider store={store}>
            <TreeVirtualizedNode index={3} style={null} data={{ ...itemData, expandedItems: ['1'] }} />
        </Provider>
        )
        expect(wrapper.find('button').length).toBe(0)
    })

    it('fires `onToggle` when expanding/collapsing node', () => {
        const onToggle = jest.fn()
        const wrapper = mount(<Provider store={store}>
            <TreeVirtualizedNode
                index={0}
                style={null}
                data={{ ...itemData, onToggle }}
            />
        </Provider>)
        wrapper.find('button').simulate('click')
        expect(onToggle).toBeCalledWith('1')
    })

    it('renders node with content optionally highlighted through search expression', () => {
        let wrapper = mount(
            <Provider store={store}>
                <TreeVirtualizedNode index={0} style={null} data={itemData} />
            </Provider>
        )
        expect(wrapper.find(`.${styles.content}`).text()).toBe('one')
        wrapper = mount(
            <Provider store={store}>
                <TreeVirtualizedNode index={7} style={null} data={itemData} />
            </Provider>
        )
        expect(wrapper.find(`.${styles.content}`).text()).toBe('Lucky Eight')
        const searchHighlighter = (text: string) => <b>{text}</b>
        wrapper = mount(
            <Provider store={store}>
                <TreeVirtualizedNode
                    index={7}
                    style={null}
                    data={{
                        ...itemData,
                        filters: [{ value: 'Lucky', fieldName: 'name', type: FilterType.contains }],
                        searchHighlighter
                    }}
                />
            </Provider>
        )
        const searchHightlightProps = wrapper.find(`.${styles.content}`).find(SearchHightlight).props()
        expect(searchHightlightProps.source).toBe('Lucky Eight')
        expect(searchHightlightProps.search).toStrictEqual(/(Lucky)/gi)
        expect(searchHightlightProps.match).toBe(searchHighlighter)
    })

    it('fires `onSelect` if possible when selecting a node', () => {
        const onSelect = jest.fn()
        let wrapper = mount(<Provider store={store}>
            <TreeVirtualizedNode index={2} style={null} data={itemData} />
        </Provider>)
        wrapper.find(`.${styles.column}`).simulate('click')
        expect(onSelect).toBeCalledTimes(0)
        wrapper = mount(<Provider store={store}>
            <TreeVirtualizedNode index={2} style={null} data={{ ...itemData, onSelect }} />
        </Provider>)
        wrapper.find(`.${styles.column}`).simulate('click')
        expect(onSelect).toBeCalledWith(items[2])
    })

    it('renders no columns when fields not provided', () => {
        const wrapper = mount(<Provider store={store}>
            <TreeVirtualizedNode
                index={0}
                style={null}
                data={{ ...itemData, fields: null }}
            />
        </Provider>)
        expect(wrapper.find(`.${styles.row}`).length).toBe(1)
        expect(wrapper.find(`.${styles.column}`).length).toBe(0)
    })
})

function getTreeSample() {
    const tree = [
        { id: '1', name: 'one', parentId: '0' },
        { id: '2', name: 'two', parentId: '0' },
        { id: '3', name: 'three', parentId: '0' },
        { id: '11', name: 'four', parentId: '1' },
        { id: '12', name: 'five', parentId: '1' },
        { id: '13', name: 'six', parentId: '1' },
        { id: '31', name: 'seven', parentId: '3' },
        { id: '32', name: 'Lucky Eight', parentId: '3' },
        { id: '21', name: 'nine', parentId: '2' },
        { id: '22', name: 'ten', parentId: '2' },
        { id: '221', name: 'eleven', parentId: '22' },
        { id: '2211', name: 'Lucky Twelve', parentId: '221' },
    ]
    return assignTreeLinks(tree)
}
