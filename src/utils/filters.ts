import {BcFilter, BcSorter} from '../interfaces/filters'
import {DataValue} from '../interfaces/data'

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
