import {DrillDownType} from './router'
import {AppNotificationType} from './objectMap'
import { DataItem } from './data'

export const enum OperationTypeCrud {
    create = 'create',
    save = 'save',
    delete = 'delete',
    associate = 'associate',
    cancelCreate = 'cancel-create'
}

export const crudOperations = [
    OperationTypeCrud.create, OperationTypeCrud.save, OperationTypeCrud.delete, OperationTypeCrud.associate, OperationTypeCrud.cancelCreate
]

/**
 * 
 * @param operationType 
 */
export function isCrud(operationType: string): operationType is OperationTypeCrud {
    return crudOperations.includes(operationType as OperationTypeCrud)
}

/**
 * 
 * @param operation 
 */
export function isOperationGroup(operation: Operation | OperationGroup): operation is OperationGroup {
    return Array.isArray((operation as OperationGroup).actions)
}

/**
 * Строковой идентификатор операции, уникально определяющий ее на виджете
 */
export type OperationType = OperationTypeCrud | string

/**
 * Операция пользователя - CRUD или любое бизнес-действие.
 * Приходит в мете записи.
 *
 * @param text - отображаемое название действия
 * @param type - тип операции; строка, уникально идентифицирующая операцию на виджете
 * @param icon - иконка, которая будет показана на кнопке операции, по базе https://ant.design/components/icon/
 * @param bcKey - key another assoc BC
 * @param showOnlyIcon - кнопка операции будет показана в виде одной иконки, без подписи
 * @param action - ???
 * @param scope - ???
 * @param preInvoke - действие, которое надо произвести прежде чем начать выполнять операцию
 * @param autoSaveBefore Validate the record for empty "required" fields before API call
 * @param confirmOperation Data for postInvokeConfirm action
 */
export interface Operation {
    text: string,
    type: OperationType,
    scope: OperationScope,
    action?: string,
    icon?: string,
    /**
     * @deprecated TODO: Remove in 2.0.0
     */
    bcKey?: string,
    showOnlyIcon: boolean,
    preInvoke?: OperationPreInvoke,
    autoSaveBefore?: boolean,
    confirmOperation?: OperationPreInvoke
}

/**
 * Группа действий, показывает название группы и раскрываемые список ее действий,
 * а также несколько действий рядом с группой, которые видны не раскрывая список.
 *
 * @param text - отображаемое название группы действий
 * @param actions - список действий в группе
 * @param maxGroupVisualButtonsCount - сколько действий будут видны, не раскрывая список
 */
export interface OperationGroup {
    type?: string,
    text: string,
    actions: Operation[],
    maxGroupVisualButtonsCount: number
}

/**
 * Действие, которое будет выполнено перед операцией пользователя
 *
 * @param type - тип действия (всплывающего сообщения, другие не поддерживаются)
 * @param message - сообщение, которое будет показано пользователю перед его операцией
 */
export interface OperationPreInvoke {
    type: OperationPreInvokeType,
    message: string
}

/**
 * Тип сообщения, которое будет показано пользователю перед его операцией
 */
export enum OperationPreInvokeType {
    /**
     * Перед операцией пользователя будет показано всплывающее сообщение "Да/Нет",
     * и операция произойдет только если пользователь скажет "Да"
     */
    confirm = 'confirm',
    /**
     * Перед операцией пользователя будет показано всплывающее сообщение
     * с иконкой информации
     */
    info = 'info',
    /**
     * Перед операцией пользователя будет показано всплывающее сообщение
     * с иконкой ошибки и операция не будет выполнена (TODO: Будет или не будет? Проверить)
     */
    error = 'error'
}

/**
 * Тип действия, которое будет выполнено после операции пользователя
 */
export const enum OperationPostInvokeType {
    /**
     * Обновление бизнес-компоненты, вызывающее сброс курсора, перезагрузку ее данных и всех ее потомков
     */
    refreshBC = 'refreshBC',
    /**
     * Вызов сохранения файла в браузере по пришедшему в ответе fileId
     */
    downloadFile = 'downloadFile',
    /**
     * Вызов сохранения файла в браузере по пришедшему в ответе url
     */
    downloadFileByUrl = 'downloadFileByUrl',
    /**
     * Вызов браузерного перехода на какую-то запись
     */
    drillDown = 'drillDown',
    /**
     * Открытие виджета-пиклиста
     */
    openPickList = 'openPickList',
    /**
     * @deprecated TODO: Не работает, удалить все упоминания из Досье и убрать всех свидетелей
     *
     */
    // delayedRefreshBC = 'delayedRefreshBC',
    /**
     * Показать всплывающее сообщение
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
 *
 * @param type Type of postInvokeConfirm action
 * @param message Title for modal
 * @param messageContent Additional text for modal
 */
export interface OperationPostInvokeConfirm {
    type: OperationPostInvokeConfirmType | string,
    message: string,
    messageContent?: string
}

/**
 * Modal window operation types
 *
 * @param type Type of postInvokeConfirm action
 * @param message Title for modal
 * @param messageContent Additional text for modal
 */
export interface OperationModalInvokeConfirm {
    type: OperationPostInvokeConfirmType | OperationPreInvokeType | string,
    message: string,
    messageContent?: string
}

/**
 * Действие, которое будет выполнено после операции пользователя
 *
 * @param type Тип действия
 * @param bc Имя бизнес-компоненты, которую надо обновлять при refreshBC
 * @param fileId Идентификатор файла, который надо скачать при downloadFile
 * @param url?
 *
 * @param [key: string] ??? TODO: Это что?
 */
export interface OperationPostInvoke {
    type: OperationPostInvokeType | string
}

/**
 * Обновление бизнес-компоненты, вызывающее сброс курсора, перезагрузку ее данных и всех ее потомков
 *
 * @param bc Имя бизнес-компоненты
 */
export interface OperationPostInvokeRefreshBc extends OperationPostInvoke {
    bc: string
}

/**
 * Вызов сохранения файла в браузере по пришедшему в ответе fileId
 *
 * @param fileId Идентификатор файла на бэке
 */
export interface OperationPostInvokeDownloadFile extends OperationPostInvoke {
    fileId: string
}

/**
 * Вызов сохранения файла в браузере по пришедшему в ответе url
 *
 * @param Адрес, по которому будет скачан файл
 */
export interface OperationPostInvokeDownloadFileByUrl extends OperationPostInvoke {
    url: string
}

/**
 * Вызов браузерного перехода на какую-то запись
 *
 * @param url Адрес перехода
 * @param drillDownType Тип перехода
 * @param urlName При выполнении перехода на внешнюю сущность (POST-запрос на пришедший url),
 * этот адрес будет передан в теле запроса (см. CBR-9320 МР и тикет)
 */
export interface OperationPostInvokeDrillDown extends OperationPostInvoke {
    url: string,
    drillDownType?: DrillDownType,
    urlName?: string,
}

/**
 * Открытие виджета-пиклиста
 *
 * @param pickList Имя БК виджета-пиклиста, который должен открыться
 */
export interface OperationPostInvokeOpenPickList extends OperationPostInvoke {
    pickList: string
}

/**
 * Показать всплывающее сообщение
 *
 * @param messageType Тип всплывающего сообщения
 * @param messageText Текст всплывающего сообщения
 */
export interface OperationPostInvokeShowMessage extends OperationPostInvoke {
    messageType: AppNotificationType,
    messageText: string
}

/**
 * Обобщение для всех возможных типов действий после операции пользователя
 */
export type OperationPostInvokeAny = OperationPostInvokeRefreshBc | OperationPostInvokeDownloadFile
    | OperationPostInvokeDownloadFileByUrl | OperationPostInvokeDrillDown
    | OperationPostInvokeOpenPickList | OperationPostInvokeShowMessage | OperationPostInvokeConfirm

/**
 * TODO: ???
 */
export type OperationScope = 'bc' | 'record' | 'page' | 'associate'

export interface AssociatedItem extends DataItem {
    _associate: boolean
}

/**
 * Дескриптор включения операции на виджете:
 * - либо строка (если надо просто включить/исключить операцию или группы)
 * - либо объект, если это группа в которой нужно выборочно включить или исключить операцию
 * 
 * @param type Тип операции; строка, уникально идентифицирующая операцию на виджете
 * @param include Список включаемых операций
 * @param exclude Список исключаемых операций
 */
export type OperationInclusionDescriptor = string | {
    type: OperationType,
    include?: OperationInclusionDescriptor[],
    exclude?: OperationType[]
}

export interface OperationError {
    success: false,
    error: {
        entity?: OperationErrorEntity
        popup?: string[],
        postActions?: OperationPostInvokeAny[]
    }
}

export interface OperationErrorEntity {
    bcName: string,
    fields: Record<string, string>,
    id: string
}
