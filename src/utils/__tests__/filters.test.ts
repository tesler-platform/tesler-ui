import {parseSorters} from '../filters'

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
