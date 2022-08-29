import { DataValue } from './data'

export enum FilterType {
    /**
     * Transforms into combination of 'greaterOrEqualThan' and 'lessOrEqualThan' (See src/utils/filters.ts)
     */
    range = 'range',
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
    type: FilterType
    fieldName: string
    value: DataValue | DataValue[]
    viewName?: string
    widgetName?: string
}

export interface BcSorter {
    fieldName: string
    direction: 'asc' | 'desc'
}

export interface FilterGroup {
    name: string
    filters: string
}
