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

import {HierarchySearchCache} from './hierarchySearchCache'
import {FilterType} from '../../interfaces/filters'

describe('hierarchySearchTest', () => {
    it('memoizes results', () => {
        const cache = new HierarchySearchCache()
        const memoizedFunction = jest.fn(() => expectedResult)
        let value = cache.getValue(memoizedFunction, 'test', data, filters)
        expect(value).toBe(expectedResult)
        expect(memoizedFunction).toBeCalledTimes(1)
        value = cache.getValue(memoizedFunction, 'test', data, filters)
        value = cache.getValue(memoizedFunction, 'test', data, filters)
        value = cache.getValue(memoizedFunction, 'test', data, filters)
        expect(memoizedFunction).toBeCalledTimes(1)
    })
    it('early returns for empty data or filters', () => {
        const cache = new HierarchySearchCache()
        const memoizedFunction = jest.fn(() => expectedResult)
        cache.getValue(memoizedFunction, 'test', null, null)
        cache.getValue(memoizedFunction, 'test', null, [])
        cache.getValue(memoizedFunction, 'test', [], null)
        cache.getValue(memoizedFunction, 'test', [], [])
        expect(memoizedFunction).toBeCalledTimes(0)
    })
    it('clears cache', () => {
        const cache = new HierarchySearchCache()
        const memoizedFunction = jest.fn(() => expectedResult)
        cache.getValue(memoizedFunction, 'test', data, filters)
        cache.clear('test')
        cache.getValue(memoizedFunction, 'test', data, filters)
        expect(memoizedFunction).toBeCalledTimes(2)
    })
})

const data = [{ id: '1', vstamp: 1, _associate: false }]
const filters = [{ type: FilterType.equals, fieldName: 'id', value: '1' }]
const expectedResult = new Set<string>()
