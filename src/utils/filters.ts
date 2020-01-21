import {BcFilter, BcSorter} from '../interfaces/filters'
import {DataValue} from '../interfaces/data'
import qs from 'query-string'

/**
 * TODO
 * 
 * @param filters
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
