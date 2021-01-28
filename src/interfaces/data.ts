import { OperationPostInvokeAny, OperationPreInvoke } from './operation'
import { DataValue, DataItem } from '@tesler-ui/schema'
export { DataValue, DataItem, MultivalueSingleValue, MultivalueSingleValueOptions, RecordSnapshotState } from '@tesler-ui/schema'

/**
 * API's response on Business Component's data request
 */
export interface BcDataResponse {
    data: DataItem[]
    hasNext: boolean
}

/**
 * Edited changes
 */
export interface PendingDataItem {
    [fieldName: string]: DataValue
}

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
        record: DataItem
        /**
         * Actions which have to do after saving
         */
        postActions?: OperationPostInvokeAny[]
        /*
         * @deprecated TODO: Remove in 2.0.0 in favor of postInvokeConfirm (is this todo needed?)
         */
        preInvoke?: OperationPreInvoke
    }
}

/**
 * `x` is name of field, for which the value will be set up.
 * A value of `x` is name of field, from which the value will be gotten.
 */
export type PickMap = Record<string, string>
