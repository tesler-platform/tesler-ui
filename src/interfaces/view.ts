import { WidgetMeta } from '../interfaces/widget'
import { RowMeta } from '../interfaces/rowMeta'
import { PendingDataItem, PickMap } from '../interfaces/data'
import { SystemNotification } from './objectMap'
import { OperationTypeCrud, OperationPostInvokeConfirm } from './operation'
import { AxiosError } from 'axios'
export { FieldType } from '@tesler-ui/schema'

export interface ViewSelectedCell {
    widgetName: string
    rowId: string
    fieldKey: string
}

export interface PendingValidationFails {
    [bcName: string]: {
        [cursor: string]: Record<string, string>
    }
}

/**
 * Describes format of `pendingValidationFails`
 * TODO remove in 2.0.0
 */
export const enum PendingValidationFailsFormat {
    old = 'old',
    target = 'target'
}

export interface ViewState extends ViewMetaResponse {
    rowMeta: {
        [bcName: string]: {
            [bcUrl: string]: RowMeta
        }
    }
    pendingDataChanges: {
        [bcName: string]: {
            [cursor: string]: PendingDataItem
        }
    }
    handledForceActive: {
        [bcName: string]: {
            [cursor: string]: PendingDataItem
        }
    }
    metaInProgress: {
        [bcName: string]: boolean
    }
    popupData?: PopupData
    infiniteWidgets?: string[]
    pickMap?: PickMap
    selectedCell?: ViewSelectedCell
    systemNotifications?: SystemNotification[]
    error?: ApplicationError
    /**
     * For backward compatibility
     *
     * `old` describes `pendingValidationFails` as `Record<string, string>`
     * `target` describes `pendingValidationFails` as `PendingValidationFails`
     */
    pendingValidationFailsFormat?: PendingValidationFailsFormat.old | PendingValidationFailsFormat.target // TODO remove in 2.0.0
    // TODO 2.0.0: should be `pendingValidationFails?: PendingValidationFails`
    pendingValidationFails?: Record<string, string> | PendingValidationFails
    modalInvoke?: {
        operation: {
            bcName: string
            operationType: OperationTypeCrud | string
            widgetName: string
        }
        confirmOperation: OperationPostInvokeConfirm
    }
}

/**
 * View description returned by Tesler API
 */
export interface ViewMetaResponse {
    /**
     * @deprecated Deprecated in favor of `name`
     */
    id?: number
    /**
     * Name of the view as specified in *.view.json file
     */
    name: string
    /**
     * Displayed title
     */
    title?: string
    /**
     * Specifies which layout template to use for the view
     *
     *Not used in Tesler UI Core, but can used by client application
     */
    template?: string
    /**
     * @deprecated Used for dynamic view layouts (configurable from user side), which are no longer implemented
     */
    customizable?: boolean
    /**
     * @deprecated Not used
     */
    editable?: boolean
    /**
     * Url for the view (usually in form of `${screen.name}/${view.name}`)
     */
    url: string
    /**
     * Widgets present on the view
     */
    widgets: WidgetMeta[]
    /**
     * @deprecated Used for dynamic view layouts (configurable from user side), which are no longer implemented
     */
    columns?: number | null
    /**
     * @deprecated Used for dynamic view layouts (configurable from user side), which are no longer implemented
     */
    rowHeight?: number | null
    /**
     * Not used in Tesler UI Core, but can be used by client application
     */
    readOnly?: boolean
    /**
     * Not used in Tesler UI Core
     *
     * TODO: Need description
     */
    ignoreHistory?: boolean
}

export type PopupType = 'assoc' | 'file-upload' | null

/**
 * Describes currently open popup
 *
 * TODO: Split interface by popup types
 */
export interface PopupData {
    /**
     * Business component of the widget that initiated popup
     *
     * TODO: Will me removed in favor of widgetName in 2.0.0
     */
    calleeBCName?: string
    /**
     * Name of the widget that initiated popup
     */
    calleeWidgetName?: string
    /**
     * Type of the popup
     *
     * TODO: Will not be optional in 2.0.0
     */
    type?: PopupType
    /**
     * Business component for widget in Popup
     *
     * TODO: Move to inherited interfaces (not all popups display widgets)
     */
    bcName?: string
    /**
     * TODO: Description + move to AssocPopupDescriptor
     */
    associateFieldKey?: string
    /**
     * TODO: Description + move to AssocPopupDescriptor
     */
    assocValueKey?: string
    /**
     * If true popup confirm button will send selected items to Tesler API
     *
     * TODO: Move to AssocPopupDescriptor
     */
    active?: boolean
    /**
     * This popup is used as a filter
     *
     * TODO: Used only by assocs so probably move to AssocPopupDescriptor
     */
    isFilter?: boolean
}

export type ApplicationError = BusinessError | SystemError | ApplicationErrorBase

export const enum ApplicationErrorType {
    BusinessError,
    SystemError,
    NetworkError
}

export interface ApplicationErrorBase {
    type: ApplicationErrorType
    code?: number
}

export interface BusinessError extends ApplicationErrorBase {
    type: ApplicationErrorType.BusinessError
    message: string
}

export interface SystemError extends ApplicationErrorBase {
    type: ApplicationErrorType.SystemError
    error?: AxiosError
    details: string
}

export interface NetworkError extends ApplicationErrorBase {
    type: ApplicationErrorType.NetworkError
}
