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
import { getSearchResult, useSearchResult } from '../useSearchResult'
import { assignTreeLinks } from '../../../../utils/tree'

describe('getSearchResult', () => {
    const sample = getTreeSample()

    it('assigns `_expanded` property for each node if their parentId presents in `expandedNodes` array', () => {
        const result = getSearchResult(sample, null, ['0', '2', '3', '22'])
        expect(result.map(item => item.id)).toEqual(expect.arrayContaining(['2', '21', '22', '221', '3', '31', '32']))
    })

    it('uses array of matching nodes, their children and ancestors when provided', () => {
        // Matching nodes found, but their parents are collapsed (e.g., user searched and then manually closed all nodes)
        expect(getSearchResult(sample, ['2211', '32'], ['0']).map(item => item.id)).toEqual(['2', '3'])
        // Matching nodes found and their parents are expanded, siblings are excluded (no match in their descendants)
        expect(getSearchResult(sample, ['2211', '32'], ['0', '221', '22', '2', '3']).map(item => item.id)).toEqual([
            '2',
            '3',
            '32',
            '22',
            '221',
            '2211'
        ])
    })

    it('returns empty array when nodes not provided', () => {
        expect(getSearchResult(null, ['3', '22'], ['0', '2']).length).toBe(0)
    })
})

describe('useSearchResult', () => {
    it('renders results of getSearchResult', () => {
        const Test = () => {
            const nodes = useSearchResult(getTreeSample(), ['2211', '32'], ['0'])
            return (
                <ul>
                    {nodes.map(item => (
                        <li key={item.id}>{item.name}</li>
                    ))}
                </ul>
            )
        }
        const wrapper = mount(<Test />)
        expect(wrapper.find('li').length).toBe(2)
        expect(wrapper.find('li').at(0).text()).toBe('two')
        expect(wrapper.find('li').at(1).text()).toBe('three')
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
        { id: '2211', name: 'Lucky Twelve', parentId: '221' }
    ]
    return assignTreeLinks(tree)
}
