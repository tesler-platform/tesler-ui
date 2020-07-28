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

import {parseSorters, getFilterType} from '../filters'
import {FieldType} from '../../interfaces/view'
import {FilterType} from '../../interfaces/filters'

test('should parse single sorter', () => {
    let source = '_sort.0.asc=ID'
    let result = parseSorters(source)
    expect(result.length).toBe(1)
    expect(result[0].fieldName).toBe('ID')
    expect(result[0].direction).toBe('asc')
    source = '_sort.0.desc=TEST'
    result = parseSorters(source)
    expect(result[0].fieldName).toBe('TEST')
    expect(result[0].direction).toBe('desc')
})

test.skip('should orderly parse multiple sorters', () => {
    // TODO:
})

test('getFilterType', () => {
    expect(getFilterType(FieldType.input)).toBe(FilterType.contains)
    expect(getFilterType(FieldType.text)).toBe(FilterType.contains)
    expect(getFilterType(FieldType.checkbox)).toBe(FilterType.specified)
    expect(getFilterType(FieldType.dictionary)).toBe(FilterType.equalsOneOf)
    expect(getFilterType(FieldType.number)).toBe(FilterType.equals)
})
