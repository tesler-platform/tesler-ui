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
import {Popover, Icon} from 'antd'
import SearchHightlight from '../../SearchHightlight/SearchHightlight'
import {FilterType} from '../../../../interfaces/filters'

type TestDataItem = {
    id: string,
    name: string,
    parent: TreeNodeBidirectional,
    parentId: string
}

describe('<TreeVirtualizedNode />', () => {

    const items = getTreeSample()
    const itemData: TreeVirtualizedNodeData<TestDataItem> = {
        items,
        fields: ['name'],
        onToggle: null,
        filters: null,
        expandedItems: null
    }

    it('renders expand button for nodes with chilren', () => {
        const wrapper = mount(<TreeVirtualizedNode index={0} style={null} data={itemData} />)
        expect(wrapper.find('button').find(Icon).props().type).toBe('plus-square')
        wrapper.setProps({ data: { ...itemData, expandedItems: ['1'] } })
        expect(wrapper.find('button').find(Icon).props().type).toBe('minus-square')
        wrapper.setProps({ index: 3 })
        expect(wrapper.find('button').length).toBe(0)
    })

    it('fires `onToggle` when expanding/collapsing node', () => {
        const onToggle = jest.fn()
        const wrapper = mount(
            <TreeVirtualizedNode
                index={0}
                style={null}
                data={{ ...itemData, onToggle }}
            />
        )
        wrapper.find('button').simulate('click')
        expect(onToggle).toBeCalledWith('1')
    })

    it('renders node with content optionally highlighted through search expression', () => {
        const wrapper = mount(<TreeVirtualizedNode index={0} style={null} data={itemData} />)
        expect(wrapper.find(`.${styles.content}`).text()).toBe('one')
        wrapper.setProps({ index: 7 })
        expect(wrapper.find(`.${styles.content}`).text()).toBe('Lucky Eight')
        const searchHighlighter = (text: string) => <b>{text}</b>
        wrapper.setProps({
            data: {
                ...itemData,
                filters: [{ value: 'Lucky', fieldName: 'name', type: FilterType.contains }],
                searchHighlighter
            }
        })
        const searchHightlightProps = wrapper.find(`.${styles.content}`).find(SearchHightlight).props()
        expect(searchHightlightProps.source).toBe('Lucky Eight')
        expect(searchHightlightProps.search).toStrictEqual(/(Lucky)/gi)
        expect(searchHightlightProps.match).toBe(searchHighlighter)
    })

    it('renders button to show popup with full text on hover', () => {
        const wrapper = mount(<TreeVirtualizedNode index={7} style={null} data={itemData} />)
        expect(wrapper.find(`.${styles.more}`).find(Popover).props().content).toBe('Lucky Eight')
    })

    it('fires `onSelect` if possible when selecting a node', () => {
        const onSelect = jest.fn()
        const wrapper = mount(<TreeVirtualizedNode index={2} style={null} data={itemData} />)
        wrapper.find(`.${styles.column}`).simulate('click')
        expect(onSelect).toBeCalledTimes(0)
        wrapper.setProps({ data: { ...itemData, onSelect }})
        wrapper.find(`.${styles.column}`).simulate('click')
        expect(onSelect).toBeCalledWith(items[2])
    })

    it('renders no columns when fields not provided', () => {
        const wrapper = mount(
            <TreeVirtualizedNode
                index={0}
                style={null}
                data={{ ...itemData, fields: null }}
            />
        )
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
