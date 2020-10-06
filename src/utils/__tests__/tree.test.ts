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

import {assignTreeLinks, getDescendants, buildSearchResultTree} from '../tree'

describe('assignTreeLinks', () => {
    const sample = getAssignTreeLinksSample()
    const result = assignTreeLinks(sample)

    it('assigns children', () => {
        expect(result.find(item => item.id === '1').children[0].id).toBe('11')
        expect(
            result
            .find(item => item.id === '2').children
            .find(item => item.id === '22').children
            .find(item => item.id === '221').children[0].id
        ).toBe('2211')
    })
    it('assigns parent', () => {
        let parent = result.find(item => item.id === '2211').parent
        const parents: string[] = []
        while (parent) {
            parents.push(parent.id)
            parent = parent.parent
        }
        expect(parents).toEqual(expect.arrayContaining(['221', '22', '2']))
    })
})

describe('getDescendants', () => {
    it('should aggregate descendent ids', () => {
        const result: string[] = []
        getDescendants(getDescendantsSample, result)
        expect(result).toEqual(expect.arrayContaining(['1', '11', '12', '121', '13', '2', '3', '31']))
    })
})

describe('buildSearchResultTree', () => {
    it('returns array of matching nodes, their direct children and every ancestor', () => {
        const sample = assignTreeLinks(getAssignTreeLinksSample())
        expect(buildSearchResultTree(sample, ['221']).map(item => item.id))
        .toEqual(expect.arrayContaining(['2211', '221', '22', '2']))
        expect(buildSearchResultTree(sample, ['999']).length).toBe(0)
        expect(buildSearchResultTree(sample, ['2', '999']).map(item => item.id))
        .toEqual(expect.arrayContaining(['2', '21', '22']))
        expect(buildSearchResultTree(sample, ['31', '22']).map(item => item.id))
        .toEqual(expect.arrayContaining(['31', '3', '22', '221', '2']))
    })
})

function getAssignTreeLinksSample() {
    return [
        { id: '1', parentId: '0' },
        { id: '2', parentId: '0' },
        { id: '3', parentId: '0' },
        { id: '11', parentId: '1' },
        { id: '12', parentId: '1' },
        { id: '13', parentId: '1' },
        { id: '31', parentId: '3' },
        { id: '312', parentId: '3' },
        { id: '21', parentId: '2' },
        { id: '22', parentId: '2' },
        { id: '221', parentId: '22' },
        { id: '2211', parentId: '221' },
    ]
}

const getDescendantsSample = [
    {
        id: '1',
        children: [
            {
                id: '11'
            },
            {
                id: '12',
                children: [{
                    id: '121'
                }]
            },
            {
                id: '13'
            },
        ]
    },
    { id: '2' },
    {
        id: '3',
        children: [
            { id: '31' }
        ]
    },
]
