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
import {TreeVirtualized} from '../TreeVirtualized'
import {TreeVirtualizedNode, TreeVirtualizedNodeProps} from '../TreeVirtualizedNode'
import {act} from 'react-dom/test-utils'
import {FilterType} from '../../../../interfaces/filters'

describe('<TreeVirtualized />', () => {
    const sample = getTreeSample()
    it('respects `matchCase` option when searching', () => {
        const wrapper = mount(
            <TreeVirtualized<typeof sample[number]>
                items={sample}
                width={640}
                height={480}
                itemSize={45}
                filters={[{ fieldName: 'name', value: 'lucky', type: FilterType.contains }]}
                fields={['name']}
                onSelect={jest.fn}
            />
        )
        expect(wrapper.find(TreeVirtualizedNode).length).toBe(6)
        expect(wrapper.find(TreeVirtualizedNode).at(0).text()).toBe('two')
        expect(wrapper.find(TreeVirtualizedNode).at(1).text()).toBe('ten')
        expect(wrapper.find(TreeVirtualizedNode).at(2).text()).toBe('eleven')
        expect(wrapper.find(TreeVirtualizedNode).at(3).text()).toBe('Lucky Twelve')
        expect(wrapper.find(TreeVirtualizedNode).at(4).text()).toBe('three')
        expect(wrapper.find(TreeVirtualizedNode).at(5).text()).toBe('lucky Eight')
        wrapper.setProps({ matchCase: true })
        expect(wrapper.find(TreeVirtualizedNode).length).toBe(2)
        expect(wrapper.find(TreeVirtualizedNode).at(0).text()).toBe('three')
        expect(wrapper.find(TreeVirtualizedNode).at(1).text()).toBe('lucky Eight')
    })

    it('expands node or collapse node and all descendants on toggle', () => {
        const wrapper = mount(
            <TreeVirtualized<typeof sample[number]>
                items={sample}
                width={640}
                height={480}
                itemSize={45}
                fields={['name']}
                onSelect={jest.fn}
            />
        )
        // initial
        expect(wrapper.find(TreeVirtualizedNode).length).toBe(3)
        expect(wrapper.find(TreeVirtualizedNode).at(0).text()).toBe('one')
        expect(wrapper.find(TreeVirtualizedNode).at(1).text()).toBe('two')
        expect(wrapper.find(TreeVirtualizedNode).at(2).text()).toBe('three')
        // open node `two`
        let props = wrapper.find(TreeVirtualizedNode).at(1)
            .props() as TreeVirtualizedNodeProps<typeof sample[number]>
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
        props = wrapper.find(TreeVirtualizedNode).at(1)
            .props() as TreeVirtualizedNodeProps<typeof sample[number]>
        act(() => {
            props.data.onToggle('2')
        })
        wrapper.update()
        expect(wrapper.find(TreeVirtualizedNode).length).toBe(3)
        expect(wrapper.find(TreeVirtualizedNode).at(0).text()).toBe('one')
        expect(wrapper.find(TreeVirtualizedNode).at(1).text()).toBe('two')
        expect(wrapper.find(TreeVirtualizedNode).at(2).text()).toBe('three')
    })
})

function getTreeSample() {
    const tree = [
        { id: '1', name: 'one', parentId: '0' },
        { id: '11', name: 'four', parentId: '1' },
        { id: '12', name: 'five', parentId: '1' },
        { id: '13', name: 'six', parentId: '1' },
        { id: '2', name: 'two', parentId: '0' },
        { id: '21', name: 'nine', parentId: '2' },
        { id: '22', name: 'ten', parentId: '2' },
        { id: '221', name: 'eleven', parentId: '22' },
        { id: '2211', name: 'Lucky Twelve', parentId: '221' },
        { id: '3', name: 'three', parentId: '0' },
        { id: '31', name: 'seven', parentId: '3' },
        { id: '32', name: 'lucky Eight', parentId: '3' },
    ]
    return tree
}
