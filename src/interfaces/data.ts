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
 */
export interface DataItem {
    /**
     * Record's identificator
     */
    id: string,
    /**
     * Version of last record's edit
     */
    vstamp: number,
    /**
     * User fields
     */
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
 */
export interface DataItemResponse {
    data: {
        /**
         * Saved record
         */
        record: DataItem,
        /**
         * Actions which have to do after saving
         */
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
 */
export interface MultivalueSingleValue {
    /**
     * Record's identificator
     */
    id: string,
    /**
     * Showed value
     */
    value: string,
    options?: MultivalueSingleValueOptions
}

/**
 * `Multivalue` field's options
 */
export interface MultivalueSingleValueOptions {
    /**
     * Hint for value
     */
    hint?: string,
    /**
     * Type of Icon
     */
    icon?: string,
    drillDown?: string,
    drillDownType?: DrillDownType,
    snapshotState?: RecordSnapshotState
}

/**
 * `key` is name of field, for which the value will be set up.
 * A value of `key` is name of field, from which the value will be gotten.
 * Пикмап.
 * Ключ указывает название поля, куда будет подставлено значение. Значение этого ключа указывает название поля, из которого будет взято
 * значение.
 */
export interface PickMap {
    [key: string]: string
}
