import {OperationPostInvokeAny} from './operation'
import {DrillDownType} from './router'

/**
 * Ответ API на запрос данных бизнес-компоненты
 */
export interface BcDataResponse {
    data: DataItem[],
    hasNext: boolean
}

/**
 * Запись, экземпляр данных бизнес-компоненты.
 * Имеет неограниченное число иных полей, доступных виджету
 *
 * @param id Идентификатор записи
 * @param vstamp Версия последнего редактирования записи
 * @param [fieldName] Пользовательские поля
 */
export interface DataItem {
    id: string,
    vstamp: number,
    [fieldName: string]: DataValue
}

/**
 * Отредактированные изменения
 */
export interface PendingDataItem {
    [fieldName: string]: DataValue
}

/**
 * Возможные типы значений полей
 */
export type DataValue = string | number | boolean | null | MultivalueSingleValue[] | undefined

/**
 * Состояние data в глобальном сторе
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
 * Результат сохранения записи, возвращенный бэком
 *
 * @param record Сохраненная запись
 * @param postActions Действия, которые надо выполнить после сохранения
 */
export interface DataItemResponse {
    data: {
        record: DataItem,
        postActions?: OperationPostInvokeAny[]
    }
}

/**
 * Структура, в которой хранятся значения Multivalue - поля
 *
 * @param id идентификатор записи
 * @param value Отображаемое значение записи
 */
export interface MultivalueSingleValue {
    id: string
    value: string
    options?: MultivalueSingleValueOptions
}

/**
 * Опции Multivalue - поля
 *
 * @param hint подсказка для значения
 */
export interface MultivalueSingleValueOptions {
    hint?: string,
    drillDown?: string,
    drillDownType?: DrillDownType
}

/**
 * Пикмап.
 * Ключ указывает название поля, куда будет подставлено значение. Значение этого ключа указывает название поля, из которого будет взято
 * значение.
 */
export interface PickMap {
    [key: string]: string
}
