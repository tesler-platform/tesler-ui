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
import { useMatchingNodes, getMatchingNodes } from '../useMatchingNodes'
import { assignTreeLinks } from '../../../../utils/tree'
import { mount } from 'enzyme'

const sample = getTreeSample()
type predicate = (item: typeof sample[0]) => boolean
const searchExpression1: predicate = item => item.name.includes('Lucky')
const searchExpression2: predicate = item => !!item.id
const searchExpression3: predicate = item => item.name.includes('eleven')

describe('getMatchingNodes', () => {
    it('finds matching nodes and their ancestors', () => {
        const { matchingNodes, ancestors } = getMatchingNodes(sample, searchExpression1)
        expect(matchingNodes).toEqual(expect.arrayContaining(['32', '2211']))
        expect(ancestors).toEqual(expect.arrayContaining(['221', '22', '2', '3', '0']))
    })

    it('returns null and root pseudo element (id=0) if some argument was not provided', () => {
        const { matchingNodes: emptyNodesMatching, ancestors: emptyNodesAncestors } = getMatchingNodes(null, searchExpression2)
        expect(emptyNodesMatching).toBe(null)
        expect(emptyNodesAncestors.length).toBe(1)
        expect(emptyNodesAncestors[0]).toBe('0')
    })
})

describe('useMatchingNodes', () => {
    it('returns matching nodes', () => {
        const Test = (props: { searchExpression: predicate }) => {
            const [, setExpandedNodes] = React.useState<string[]>([])
            const matchingNodes = useMatchingNodes(sample, props.searchExpression, setExpandedNodes)
            return (
                <ul>
                    {matchingNodes.map(item => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            )
        }
        const wrapper = mount(<Test searchExpression={searchExpression1} />)
        expect(wrapper.find('li').length).toBe(2)
        expect(wrapper.find('li').get(0).props.children).toBe('32')
        expect(wrapper.find('li').get(1).props.children).toBe('2211')
        wrapper.setProps({ searchExpression: searchExpression2 })
        expect(wrapper.find('li').length).toBe(sample.length)
    })

    it('pass ancestors of matching nodes to a callback', () => {
        const callback = jest.fn()
        const Test = (props: { searchExpression: predicate }) => {
            useMatchingNodes(sample, props.searchExpression, callback)
            return <div>test</div>
        }
        const wrapper = mount(<Test searchExpression={searchExpression1} />)
        expect(callback).toBeCalledWith(expect.arrayContaining(['221', '22', '2', '3', '0']))
        wrapper.setProps({ searchExpression: searchExpression3 })
        expect(callback).toBeCalledWith(expect.arrayContaining(['22', '2', '0']))
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
