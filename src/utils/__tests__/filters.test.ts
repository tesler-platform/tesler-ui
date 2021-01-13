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

import { getFilters, getSorters, parseSorters, getFilterType, parseFilters } from '../filters'
import { FieldType } from '../../interfaces/view'
import { FilterType } from '../../interfaces/filters'

describe('getFilters', () => {
    it('should map input values to dictionary with keys of `${filter.fieldName}.${filter.type}', () => {
        expect(
            getFilters([
                {
                    type: FilterType.contains,
                    fieldName: 'test-field',
                    value: 'test-value'
                }
            ])
        ).toMatchObject({ 'test-field.contains': 'test-value' })
        expect(
            getFilters([
                {
                    type: FilterType.contains,
                    fieldName: 'test-field1',
                    value: 'test-value1'
                },
                {
                    type: FilterType.equals,
                    fieldName: 'test-field2',
                    value: 5
                }
            ])
        ).toMatchObject({ 'test-field1.contains': 'test-value1', 'test-field2.equals': '5' })
    })
    it('should stringify array values with each item enclosed with double quote ', () => {
        expect(
            getFilters([
                {
                    type: FilterType.equalsOneOf,
                    fieldName: 'test-field',
                    value: ['test-value1', 'test-value2']
                }
            ])
        ).toMatchObject({ 'test-field.equalsOneOf': '["test-value1","test-value2"]' })
        expect(
            getFilters([
                {
                    type: FilterType.containsOneOf,
                    fieldName: 'test-field',
                    value: [4, 6, 6, 0]
                }
            ])
        ).toMatchObject({ 'test-field.containsOneOf': '["4","6","6","0"]' })
    })
    it('should return null on empty input', () => {
        expect(getFilters(undefined)).toBe(null)
        expect(getFilters(null)).toBe(null)
        expect(getFilters([])).toBe(null)
    })
})

describe('getSorters', () => {
    it('should map input fieldNames into a dictionary with keys of `_sort.${index}.${item.direction}`', () => {
        expect(
            getSorters([
                {
                    fieldName: 'test1',
                    direction: 'asc'
                },
                {
                    fieldName: 'test2',
                    direction: 'desc'
                }
            ])
        ).toMatchObject({ '_sort.0.asc': 'test1', '_sort.1.desc': 'test2' })
    })
    it('should return null on empty input', () => {
        expect(getSorters(undefined)).toBe(null)
        expect(getSorters(null)).toBe(null)
        expect(getSorters([])).toBe(null)
    })
})

describe('parseFilters', () => {
    it('parses simple values', () => {
        const filters = parseFilters('test-field1.equals=4&test-field2.contains=test')
        expect(filters[0]).toEqual({
            fieldName: 'test-field1',
            type: FilterType.equals,
            value: '4'
        })
        expect(filters[1]).toEqual({
            fieldName: 'test-field2',
            type: FilterType.contains,
            value: 'test'
        })
        expect(filters.length).toBe(2)
    })

    it('parses value as array for array filter types', () => {
        const filters = parseFilters('test-field1.containsOneOf=["test1","test2","test3"]&test-field2.contains=test')
        expect(filters[0]).toEqual({
            fieldName: 'test-field1',
            type: FilterType.containsOneOf,
            value: expect.arrayContaining(['test1', 'test2', 'test3'])
        })
        expect(filters[1]).toEqual({
            fieldName: 'test-field2',
            type: FilterType.contains,
            value: 'test'
        })
    })

    it('skips filters with any attribute missing', () => {
        expect(parseFilters('.equals=1&test-field2.contains=test')).toEqual([
            {
                fieldName: 'test-field2',
                type: FilterType.contains,
                value: 'test'
            }
        ])
        expect(parseFilters('test-field1.=1&test-field2.contains=test')).toEqual([
            {
                fieldName: 'test-field2',
                type: FilterType.contains,
                value: 'test'
            }
        ])
        expect(parseFilters('test-field1.equals=&test-field2.contains=test')).toEqual([
            {
                fieldName: 'test-field2',
                type: FilterType.contains,
                value: 'test'
            }
        ])
    })

    it('throws warning and fallbacks to empty array for unparsable values', () => {
        const spy = jest.spyOn(console, 'warn').mockImplementation()
        const filters = parseFilters('test-field1.containsOneOf=[\'test1","test2","test3"]')
        expect(filters[0]).toEqual({
            fieldName: 'test-field1',
            type: FilterType.containsOneOf,
            value: []
        })
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })

    it('returns null on empty input', () => {
        expect(parseFilters('')).toBe(null)
        expect(parseFilters(null)).toBe(null)
        expect(parseFilters(undefined)).toBe(null)
    })
})

describe('parseSorters', () => {
    it('should parse sorters', () => {
        const result = parseSorters('_sort.0.asc=ID&_sort.1.desc=TEST')
        expect(result.length).toBe(2)
        expect(result[0]).toEqual({
            fieldName: 'ID',
            direction: 'asc'
        })
        expect(result[1]).toEqual({
            fieldName: 'TEST',
            direction: 'desc'
        })
    })
    it('should use index to restore sorters order', () => {
        const result = parseSorters('_sort.1.asc=ID&_sort.0.desc=TEST')
        expect(result.length).toBe(2)
        expect(result[0]).toEqual({
            fieldName: 'TEST',
            direction: 'desc'
        })
        expect(result[1]).toEqual({
            fieldName: 'ID',
            direction: 'asc'
        })
    })
    it('should return null on empty input', () => {
        expect(parseSorters(undefined)).toBe(null)
        expect(parseSorters(null)).toBe(null)
        expect(parseSorters('')).toBe(null)
    })
})

describe('getFilterType', () => {
    it('getFilterType', () => {
        expect(getFilterType(FieldType.input)).toBe(FilterType.contains)
        expect(getFilterType(FieldType.text)).toBe(FilterType.contains)
        expect(getFilterType(FieldType.checkbox)).toBe(FilterType.specified)
        expect(getFilterType(FieldType.dictionary)).toBe(FilterType.equalsOneOf)
        expect(getFilterType(FieldType.number)).toBe(FilterType.equals)
    })
})
