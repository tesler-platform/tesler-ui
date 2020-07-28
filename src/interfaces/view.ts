import {WidgetMeta} from '../interfaces/widget'
import {RowMeta} from '../interfaces/rowMeta'
import {PendingDataItem, PickMap} from '../interfaces/data'
import {SystemNotification} from './objectMap'
import {OperationTypeCrud, OperationPostInvokeConfirm} from './operation'

export interface ViewSelectedCell {
    widgetName: string,
    rowId: string,
    fieldKey: string,
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
            widgetName: string,
        }
        confirmOperation: OperationPostInvokeConfirm,
    },
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

/**
 * Дескриптор текущего открытого во всплывающем окне виджета
 * TODO: Разделить интерфейс на пиклисты и ассоки
 *
 * @param bcName Имя бизнес-компоненты виджета
 * @param calleeBCName Имя бизнес-компоненты виджета, который запросил всплывающий виджет
 * @param associateFieldKey ???
 * @param assocValueKey ???
 * @param active Если этот флаг указан, то виджет отправляет выбранные значения на бэк по кнопке подтверждения в модальном окне
 * @param filter this popup is filter form
 */
export interface PopupData {
    bcName: string,
    calleeBCName?: string,
    associateFieldKey?: string,
    assocValueKey?: string,
    active?: boolean,
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
    type: ApplicationErrorType.NetworkError,
}
