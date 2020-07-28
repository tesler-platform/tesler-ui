import {BcFilter, BcSorter, FilterType} from '../interfaces/filters'
import {DataValue} from '../interfaces/data'
import qs from 'query-string'
import {FieldType} from '../interfaces/view'

/**
 * Map an input array of BcFilter objects into a dictionary of GET-request params
 * 
 * Name of the param formed as `${filter.fieldName}.${filter.type}`
 * Value of the param is a stringified JSON array with each `filter.value` item turned
 * to string if `filter.value` is an array or just `filter.value` otherwise.
 * 
 * @param filters Filters for business components
 * @returns Dictionary of query-params for GET-request
 */
export function getFilters(filters: BcFilter[]) {
    if (!filters || !filters.length) {
        return null
    }
    const result: Record<string, string> = {}
    filters.forEach(item => {
        let value = String(item.value)
        if (Array.isArray(item.value)) {
            const values = (item.value as DataValue[]).map(val => `"${val}"`)
            value = `[${values}]`
        }
        result[`${item.fieldName}.${item.type}`] = value
    })
    return result
}

/**
 * TODO
 * 
 * @param sorters 
 */
export function getSorters(sorters: BcSorter[]) {
    if (!sorters || !sorters.length) {
        return null
    }
    const result: Record<string, string> = {}
    sorters.forEach((item, index) => {
        result[`_sort.${index}.${item.direction}`] = item.fieldName
    })
    return result
}

/**
 * Function for parsing filters from string into BcFilter type
 *
 * @param defaultFilters string representation of filters
 */
export function parseFilters(defaultFilters: string) {
    const result: BcFilter[] = []
    const urlParams = qs.parse(defaultFilters)
    Object.keys(urlParams).forEach((param) => {
        const [fieldName, type] = param.split('.')
        if (fieldName && type && urlParams[param]) {
            let value = urlParams[param]
            if (type === FilterType.containsOneOf || type === FilterType.equalsOneOf) {
                try {
                    value = JSON.parse(value)
                } catch (e) {
                    console.warn(e)
                }
                value = Array.isArray(value) ? value : []
            }
            result.push({
                fieldName,
                type: type as FilterType,
                value
            })
        }
    })
    return result.length ? result : null
}

/**
 * Parse sorter string into separate sorter objects.
 * String representation of sorters is url based:
 * "_sort.{order}.{direction}={fieldKey}&_sort.{order}.{direction}"
 *      @param fieldKey Sort by field
 *      @param order Priority of this specfic sorter
 *      @param direction "asc" or "desc"
 * 
 * i.e. "_sort.0.asc=firstName"
 * 
 * @param sorters string representation of sorters
 */
export function parseSorters(sorters: string) {
    if (!sorters || !sorters.length) {
        return null
    }
    const result: BcSorter[] = []
    const dictionary = qs.parse(sorters)
    Object.entries(dictionary)
    .map(([sort, fieldKey]) => {
        const [ order, direction ] = sort.split('.').slice(1)
        return { fieldName: fieldKey as string, order: Number.parseInt(order, 10), direction }
    })
    .sort((a, b) => a.order - b.order)
    .forEach(item => {
        result.push({ fieldName: item.fieldName, direction: item.direction as 'asc' | 'desc' })
    })
    return result
}

/**
 * Returns appropriate filtration type for specified field type.
 * 
 * - Text-based fields use `contains`
 * - Checkbox fields use `specified` (boolean)
 * - Dictionary fiels use `equalsOneOf`
 * 
 * All other field types use strict `equals`
 * 
 * @param fieldType Field type
 */
export function getFilterType(fieldType: FieldType) {
    switch (fieldType) {
        case(FieldType.dictionary): {
            return FilterType.equalsOneOf
        }
        case(FieldType.checkbox): {
            return FilterType.specified
        }
        case(FieldType.input):
        case(FieldType.text): {
            return FilterType.contains
        }
        default:
            return FilterType.equals
    }
}
