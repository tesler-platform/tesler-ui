import {OperationPostInvokeAny, OperationPreInvoke} from './operation'
import {DrillDownType} from './router'

/**
 * API's response on Business Component's data request
 */
export interface BcDataResponse {
    data: DataItem[],
    hasNext: boolean
}

/**
 * Instance of `Business component` data
 * Has unlimited number of fields, which available to widget
 *
 * @param id Record's identificator
 * @param vstamp Version of last record's edit
 * @param [fieldName] User fields
 */
export interface DataItem {
    id: string,
    vstamp: number,
    [fieldName: string]: DataValue
}

/**
 * Edited changes
 */
export interface PendingDataItem {
    [fieldName: string]: DataValue
}

/**
 * Possible types of fields values
 */
export type DataValue = string | number | boolean | null | MultivalueSingleValue[] | undefined | DataItem[]

/**
 * State of `data` in global store
 */
export interface DataState {
    [bcName: string]: DataItem[]
}

export interface DepthDataState {
    [depth: number]: {
        [bcName: string]: DataItem[]
    }
}

/**
 * Result of saving record, which back-end returns
 *
 * @param record Saved record
 * @param postActions Actions which have to do after saving
 */
export interface DataItemResponse {
    data: {
        record: DataItem,
        postActions?: OperationPostInvokeAny[],
        /*
        * @deprecated TODO: Remove in 2.0.0 in favor of postInvokeConfirm (is this todo needed?)
        */
        preInvoke?: OperationPreInvoke
    }
}

export const enum RecordSnapshotState {
    noChange = 'noChange',
    new = 'new',
    deleted = 'deleted'
}

/**
 * Structure which contain `Multivalue` field's values
 *
 * @param id Record's identificator
 * @param value Showed value
 */
export interface MultivalueSingleValue {
    id: string
    value: string
    options?: MultivalueSingleValueOptions
}

/**
 * `Multivalue` field's options
 *
 * @param hint Hint for value
 */
export interface MultivalueSingleValueOptions {
    hint?: string,
    drillDown?: string,
    drillDownType?: DrillDownType,
    snapshotState?: RecordSnapshotState
}

/**
 * `key` is name of field, for which the value will be setted up.
 *  A value of `key` is name of field, from which the value will be gotten.
 *  Пикмап.
 * Ключ указывает название поля, куда будет подставлено значение. Значение этого ключа указывает название поля, из которого будет взято
 * значение.
 */
export interface PickMap {
    [key: string]: string
}
