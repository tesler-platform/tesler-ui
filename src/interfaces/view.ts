import {WidgetMeta} from '../interfaces/widget'
import {RowMeta} from '../interfaces/rowMeta'
import {PendingDataItem, PickMap} from '../interfaces/data'
import {SystemNotification} from './objectMap'
import {OperationTypeCrud, OperationPostInvokeConfirm} from './operation'
import {AxiosError} from 'axios'

export interface ViewSelectedCell {
    widgetName: string,
    rowId: string,
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
export enum PendingValidationFailsFormat {
    old = 'old',
    target = 'target'
}

export interface ViewState extends ViewMetaResponse {
    rowMeta: {
        [bcName: string]: {
            [bcUrl: string]: RowMeta
        }
    },
    pendingDataChanges: {
        [bcName: string]: {
            [cursor: string]: PendingDataItem
        }
    },
    handledForceActive: {
        [bcName: string]: {
            [cursor: string]: PendingDataItem
        }
    },
    metaInProgress: {
        [bcName: string]: boolean
    },
    popupData?: PopupData,
    infiniteWidgets?: string[],
    pickMap?: PickMap,
    selectedCell?: ViewSelectedCell,
    systemNotifications?: SystemNotification[],
    error?: ApplicationError,
    /**
     * For backward compatibility
     *
     * `old` describes `pendingValidationFails` as `Record<string, string>`
     * `target` describes `pendingValidationFails` as `PendingValidationFails`
     */
    pendingValidationFailsFormat?: PendingValidationFailsFormat.old | PendingValidationFailsFormat.target, // TODO remove in 2.0.0
    // TODO 2.0.0: should be `pendingValidationFails?: PendingValidationFails`
    pendingValidationFails?: Record<string, string> | PendingValidationFails,
    modalInvoke?: {
        operation: {
            bcName: string,
            operationType: OperationTypeCrud | string,
            widgetName: string
        },
        confirmOperation: OperationPostInvokeConfirm
    }
}

export interface ViewMetaResponse {
    id: number,
    name: string,
    title?: string,
    template?: string,
    customizable?: boolean,
    editable?: boolean,
    url: string,
    widgets: WidgetMeta[],
    columns: number | null,
    rowHeight: number | null,
    readOnly: boolean,
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
    calleeBCName?: string,
    /**
     * Name of the widget that initiated popup
     */
    calleeWidgetName?: string,
    /**
     * Type of the popup
     *
     * TODO: Will not be optional in 2.0.0
     */
    type?: PopupType,
    /**
     * Business component for widget in Popup
     *
     * TODO: Move to inherited interfaces (not all popups display widgets)
     */
    bcName?: string,
    /**
     * TODO: Description + move to AssocPopupDescriptor
     */
    associateFieldKey?: string,
    /**
     * TODO: Description + move to AssocPopupDescriptor
     */
    assocValueKey?: string,
    /**
     * If true popup confirm button will send selected items to Tesler API
     *
     * TODO: Move to AssocPopupDescriptor
     */
    active?: boolean,
    /**
     * This popup is used as a filter
     *
     * TODO: Used only by assocs so probably move to AssocPopupDescriptor
     */
    isFilter?: boolean
}

export enum FieldType {
    number = 'number',
    input = 'input',
    monthYear = 'monthYear',
    date = 'date',
    dateTime = 'dateTime',
    dateTimeWithSeconds = 'dateTimeWithSeconds',
    checkbox = 'checkbox',
    /**
     * @deprecated TODO: project-specific, remove in 2.0.0
     */
    checkboxSql = 'checkboxSql',
    /**
     * @deprecated TODO: project-specific, remove in 2.0.0
     */
    DMN = 'DMN',
    pickList = 'pickList',
    inlinePickList = 'inline-pickList',
    dictionary = 'dictionary',
    hidden = 'hidden', // @deprecated TODO: Remove in 2.0.0 in favor of `hidden` flag of widget meta field description
    text = 'text',
    percent = 'percent',
    fileUpload = 'fileUpload',
    money = 'money',
    /**
     * @deprecated TODO: project-specific, remove in 2.0.0
     */
    comboCondition = 'combo-condition',
    richText = 'richText',
    printForm = 'printForm',
    multifield = 'multifield',
    multivalue = 'multivalue',
    multivalueHover = 'multivalueHover',
    hint = 'hint',
    radio = 'radio'
}

export type ApplicationError = BusinessError | SystemError | ApplicationErrorBase

export enum ApplicationErrorType {
    BusinessError,
    SystemError,
    NetworkError
}

export interface ApplicationErrorBase {
    type: ApplicationErrorType,
    code?: number
}

export interface BusinessError extends ApplicationErrorBase {
    type: ApplicationErrorType.BusinessError,
    message: string
}

export interface SystemError extends ApplicationErrorBase {
    type: ApplicationErrorType.SystemError,
    error?: AxiosError,
    details: string
}

export interface NetworkError extends ApplicationErrorBase {
    type: ApplicationErrorType.NetworkError
}
