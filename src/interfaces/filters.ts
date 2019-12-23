import {DataValue} from './data'

export const enum FilterType {
    equals = 'equals',
    greaterThan = 'greaterThan',
    lessThan = 'lessThan',
    greaterOrEqualThan = 'greaterOrEqualThan',
    lessOrEqualThan = 'lessOrEqualThan',
    contains = 'contains',
    specified = 'specified',
    specifiedBooleanSql = 'specifiedBooleanSql',
    equalsOneOf = 'equalsOneOf',
    containsOneOf = 'containsOneOf'
}

export interface BcFilter {
    type: FilterType,
    fieldName: string,
    value: DataValue | DataValue[]
}

export interface BcSorter {
    fieldName: string,
    direction: 'asc' | 'desc'
}
