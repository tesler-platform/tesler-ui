/**
 * Интерфейсы для Business Component'ы
 */

import {FilterGroup} from './filters'

 /**
  * Meta data for Business Component
  * 
  * @param name Name of Business Component
  * @param parentName Name of parent Business Component
  * @param url TODO: desc, example
  * @param cursor Currently active record
  * @param defaultSort String representation of default bc sorters
  *     "_sort.{order}.{direction}={fieldKey}&_sort.{order}.{direction}"
  *     @param fieldKey Sort by field
  *     @param order Priority of this specfic sorter
  *     @param direction "asc" or "desc"
  *     i.e. "_sort.0.asc=firstName"
  * @param filterGroups Predefined filters
  */
export interface BcMeta {
    name: string
    parentName: string | null
    url: string,
    cursor: string | null,
    defaultSort?: string,
    filterGroups?: FilterGroup[]
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
