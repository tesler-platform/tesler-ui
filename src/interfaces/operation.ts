import { DrillDownType } from './router'
import { AppNotificationType } from './objectMap'
import { DataItem } from './data'

/**
 * TODO: Rename to CoreOperationRole in 2.0.0
 */
export const enum OperationTypeCrud {
    create = 'create',
    save = 'save',
    delete = 'delete',
    associate = 'associate',
    cancelCreate = 'cancel-create',
    fileUpload = 'file-upload'
}

export const coreOperations = [
    OperationTypeCrud.create,
    OperationTypeCrud.save,
    OperationTypeCrud.delete,
    OperationTypeCrud.associate,
    OperationTypeCrud.cancelCreate,
    OperationTypeCrud.fileUpload
]

/**
 *
 * @param operationType
 */
export function isCoreOperation(operationType: string): operationType is OperationTypeCrud {
    return coreOperations.includes(operationType as OperationTypeCrud)
}

/**
 *
 * @param operation
 */
export function isOperationGroup(operation: Operation | OperationGroup): operation is OperationGroup {
    return Array.isArray((operation as OperationGroup).actions)
}

/**
 * String that uniquely identifies an operation on widget
 */
export type OperationType = OperationTypeCrud | string

/**
 * User operation: CRUD or any custom business action.
 *
 * Received from record's row meta.
 */
export interface Operation {
    /**
     * Displayed name
     */
    text: string
    /**
     * String that uniquely identifies an operation on widget
     */
    type: OperationType
    /**
     * A hint to decide where to display an operation which is related to the record or the whole widget
     */
    scope: OperationScope
    /**
     * @deprecated TODO: Remove in 2.0.0, designation unknown
     */
    action?: string
    /**
     * An icon (https://ant.design/components/icon) to display on operation button,
     */
    icon?: string
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of client-side custom parameters
     */
    bcKey?: string
    /**
     * Omit text value of operation in favor of icon
     */
    showOnlyIcon?: boolean
    /**
     * An operation that should be fired before initiating this operation
     */
    preInvoke?: OperationPreInvoke
    /**
     * Validate the record for empty "required" fields before API call
     */
    autoSaveBefore?: boolean
    /**
     * ???
     */
    confirmOperation?: OperationPreInvoke
    /**
     * If custom operation needs to be processed as if it was a default crud operation,
     * this flag can be specified and will be used instead of real `type`
     */
    actionRole?: OperationType
}

/**
 * Group of actions.
 *
 * It shows name of a group, drop down list of actions
 * and some actions which are shown in case list is covered.
 * Группа действий, показывает название группы и раскрываемые список ее действий,
 * а также несколько действий рядом с группой, которые видны не раскрывая список.
 */
export interface OperationGroup {
    /**
     * Unique identifier for the operation group
     */
    type?: string
    /**
     * Displayed name of a group
     */
    text: string
    /**
     * An icon (https://ant.design/components/icon) to display on operation button,
     */
    icon?: string
    /**
     * Omit text value of operation in favor of icon
     */
    showOnlyIcon?: boolean
    /**
     * List of group actions
     */
    actions: Operation[]
    /**
     * Number of showed actions in case list is covered
     */
    maxGroupVisualButtonsCount: number
}

/**
 * An action which fires before user's operation
 */
export interface OperationPreInvoke {
    /**
     * A type of operation (Pop-up message. Other types are not supported)
     */
    type: OperationPreInvokeType
    /**
     * A message shown to user before operation fires
     */
    message: string
}

/**
 * A type of message shown to user before operation fires
 */
export enum OperationPreInvokeType {
    /**
     * Pop-up message contains "Yes/No" answers.
     * If user says "Yes" then operation fires
     */
    confirm = 'confirm',
    /**
     * Pop-up message contains some informational text with info icon
     */
    info = 'info',
    /**
     * Pop-up message contains some information about error with error icon
     * Перед операцией пользователя будет показано всплывающее сообщение
     * с иконкой ошибки и операция не будет выполнена (TODO: Будет или не будет? Проверить)
     */
    error = 'error'
}

/**
 * A type of action which fires after user's operation
 */
export const enum OperationPostInvokeType {
    /**
     * BC's refresh. It leads to cursor dropping, data refresh of current BC and its children
     */
    refreshBC = 'refreshBC',
    /**
     * File downloading by `fileId` which comes from  answer to user's operation.
     * Вызов сохранения файла в браузере по пришедшему в ответе fileId
     */
    downloadFile = 'downloadFile',
    /**
     * File downloading by `url` which comes from  answer to user's operation.
     * Вызов сохранения файла в браузере по пришедшему в ответе url
     */
    downloadFileByUrl = 'downloadFileByUrl',
    /**
     * Calling a browser transition to some record
     */
    drillDown = 'drillDown',
    /**
     * `Pick list` widget opening
     */
    openPickList = 'openPickList',
    /**
     * @deprecated TODO: Не работает, удалить все упоминания из Досье и убрать всех свидетелей
     *
     */
    // delayedRefreshBC = 'delayedRefreshBC',
    /**
     * Showing pop-up message
     */
    showMessage = 'showMessage',
    /**
     * Инициировать удаление записей
     *
     * @deprecated TODO: Бэк должен сам их удалить и в ответе возвращать список удаленных
     * Не использовать и убрать с Досье, когда определимся с форматом ответов
     */
    postDelete = 'postDelete'
}

/**
 * The type of message that will be shown to the user for confirmation
 */
export enum OperationPostInvokeConfirmType {
    /**
     * Simple confirmation
     */
    confirm = 'confirm',
    /**
     * Сonfirmation with text from the user
     */
    confirmText = 'confirmText'
}

/**
 * The action that will be performed after the user confirms it
 */
export interface OperationPostInvokeConfirm {
    /**
     * Type of postInvokeConfirm action
     */
    type: OperationPostInvokeConfirmType | string
    /**
     * Title for modal
     */
    message: string
    /**
     * Additional text for modal
     */
    messageContent?: string
}

/**
 * Modal window operation types
 */
export interface OperationModalInvokeConfirm {
    /**
     * Type of postInvokeConfirm action
     */
    type: OperationPostInvokeConfirmType | OperationPreInvokeType | string
    /**
     * Title for modal
     */
    message: string
    /**
     * Additional text for modal
     */
    messageContent?: string
}

/**
 * An action which fires after user's operation
 *
 * @param bc Имя бизнес-компоненты, которую надо обновлять при refreshBC
 * @param fileId Идентификатор файла, который надо скачать при downloadFile
 * @param url?
 *
 * @param [key: string] ??? TODO: Это что?
 */
export interface OperationPostInvoke {
    /**
     * A type of action
     */
    type: OperationPostInvokeType | string
}

/**
 * BC's refresh. It leads to cursor dropping, data refresh of current BC and its children
 */
export interface OperationPostInvokeRefreshBc extends OperationPostInvoke {
    /**
     * BC's name
     */
    bc: string
}

/**
 * File downloading by `fileId` which comes from  answer.
 */
export interface OperationPostInvokeDownloadFile extends OperationPostInvoke {
    /**
     * Backend's file ID
     */
    fileId: string
}

/**
 * File downloading by `url` which comes from answer.
 */
export interface OperationPostInvokeDownloadFileByUrl extends OperationPostInvoke {
    /**
     * File's URL
     */
    url: string
}

/**
 * Calling a browser transition to some record
 *
 * @param urlName При выполнении перехода на внешнюю сущность (POST-запрос на пришедший url),
 * этот адрес будет передан в теле запроса (см. CBR-9320 МР и тикет)
 */
export interface OperationPostInvokeDrillDown extends OperationPostInvoke {
    /**
     * URL of transition
     */
    url: string
    /**
     * A type of transition
     */
    drillDownType?: DrillDownType
    /**
     * If transition performs to outer entity (POST call),
     * this param will be passed to request body
     */
    urlName?: string
}

/**
 * `Pick list` widget opening
 */
export interface OperationPostInvokeOpenPickList extends OperationPostInvoke {
    /**
     * BC name of pick list widget
     */
    pickList: string
}

/**
 * Pop-up message showing
 */
export interface OperationPostInvokeShowMessage extends OperationPostInvoke {
    /**
     * A type of a message
     */
    messageType: AppNotificationType
    /**
     * A text of a message
     */
    messageText: string
}

/**
 * A union of all action types which could be be fired after user's operation
 */
export type OperationPostInvokeAny =
    | OperationPostInvokeRefreshBc
    | OperationPostInvokeDownloadFile
    | OperationPostInvokeDownloadFileByUrl
    | OperationPostInvokeDrillDown
    | OperationPostInvokeOpenPickList
    | OperationPostInvokeShowMessage
    | OperationPostInvokeConfirm

/**
 * TODO: ???
 */
export type OperationScope = 'bc' | 'record' | 'page' | 'associate'

export interface AssociatedItem extends DataItem {
    _associate: boolean
}

/**
 * Descriptor enabling operation on widget:
 * - string (if you just need to include / exclude operation or groups)
 * - object, if this is group in which you want to selectively include or exclude the operation
 */
export type OperationInclusionDescriptor =
    | string
    | {
          /**
           * Type of transaction; a string that uniquely identifies the operation on the widget
           */
          type: OperationType
          /**
           * List of included operations or groups operations
           */
          include?: OperationInclusionDescriptor[]
          /**
           * List of excluded operations or groups operations
           */
          exclude?: OperationType[]
      }

export interface OperationError {
    success: false
    error: {
        entity?: OperationErrorEntity
        popup?: string[]
        postActions?: OperationPostInvokeAny[]
    }
}

export interface OperationErrorEntity {
    bcName: string
    fields: Record<string, string>
    id: string
}
