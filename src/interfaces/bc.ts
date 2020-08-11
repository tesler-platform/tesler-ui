/**
 * Interfaces for Business Component
 */

import {FilterGroup} from './filters'

/**
 * Meta data for Business Component
 */
export interface BcMeta {
    /**
     * Name of Business Component
     */
    name: string
    /**
     * Name of parent Business Component
     */
    parentName: string | null
    /**
     * TODO: desc, example
     */
    url: string,
    /**
     * Currently active record
     */
    cursor: string | null,
    /**
     * String representation of default bc sorters
     *     "_sort.{order}.{direction}={fieldKey}&_sort.{order}.{direction}"
     *     @param fieldKey Sort by field
     *     @param order Priority of this specific sorter
     *     @param direction "asc" or "desc"
     *     i.e. "_sort.0.asc=firstName"
     */
    defaultSort?: string,
    /**
     * Predefined filters
     */
    filterGroups?: FilterGroup[],
    /**
     * String representation of default bc filters
     *     "{fieldKey}.contains={someValue}"
     *     @param fieldKey Filtering field
     *     @param someValue Filter value
     *     i.e. "someField1.contains=someValue&someField2.equalsOneOf=%5B%22someValue1%22%2C%22someValue2%22%5D"
     */
    defaultFilter?: string
}

export interface BcMetaState extends BcMeta {
    loading?: boolean
    page?: number
    limit?: number
    hasNext?: boolean
    depthBc?: Record<
        number,
        {
            loading?: boolean,
            cursor?: string,
        }
    >
}
