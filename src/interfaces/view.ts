import {WidgetMeta} from '../interfaces/widget'
import {RowMeta} from '../interfaces/rowMeta'
import {PendingDataItem, PickMap} from '../interfaces/data'
import {SystemNotification} from './objectMap'
import {OperationTypeCrud, OperationPostInvokeConfirm} from './operation'

export interface ViewSelectedCell {
    widgetName: string,
    rowId: string,
    fieldKey: string
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
    pendingValidationFails?: Record<string, string>,
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
    // template?: EViewTemplate,
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

export const enum FieldType {
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

export const enum ApplicationErrorType {
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
    details: string
}

export interface NetworkError extends ApplicationErrorBase {
    type: ApplicationErrorType.NetworkError
}
