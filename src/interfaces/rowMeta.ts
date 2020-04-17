import {TeslerResponse} from './objectMap'
import {Operation, OperationGroup, OperationPostInvokeAny} from './operation'
import {DataValue} from './data'

/**
 * Мета записи, содержит информацию:
 *
 * @param actions о действиях, которые с ней можно совершить
 * @param fields о полях, которые есть в этой записи
 * @param errors об ошибках, если запись не проходит валидацию бэка
 *
 * TODO: По смыслу тут должно быть название DataItemMeta
 */
export interface RowMeta {
    actions: Array<Operation | OperationGroup>,
    fields: RowMetaField[],
    errors?: Record<string, string>,
    // TODO: В Досье это по ошибке в интерфейсе ответа бэка, хотя заполняется локально
    // conflicts?: ObjectMap<TDataValue> Переделать в Досье и убрать отсюда
}

export interface RowMetaResponse extends TeslerResponse {
    data: {
        row: RowMeta,
        postActions?: OperationPostInvokeAny[]
    }
}

/**
 * Мета поля, которую предоставляет мета записи.  
 * Описывает разную дополнительную информацию о поле, которая не связана
 * с конкретной записью или с конкретным виджетом.
 *
 * @param key - ключ поля, уникально его идентифицирующий (см. DataItem [fieldName: string])
 * @param currentValue - актуальное значение на бэке, присылаемое на случай конфликтов совместного изменения
 * @param disabled - доступно ли поле для редактирования
 * @param placeholder - hint for filling the field
 * @param ephemeral - при любой операции поле будет отправляться на бэк, даже если не изменялось
 * @param hidden - поле не видно пользователю
 * @param required - поле обязательно для заполнения
 * @param forceActive - любое изменение этого поля пользователем должно инициировать запрос новой меты записи
 * @param drillDown - адрес, по которому поле позволяет осуществить переход
 * @param drillDownType - как будет обработан переход по адресу в браузере
 * @param values TODO:
 * @param filterValues TODO:
 * @param filterable - можно ли фильтровать записи по этому полю
 */
export interface RowMetaField {
    key: string,
    defaultValue?: DataValue,
    currentValue: DataValue,
    disabled?: boolean,
    placeholder?: string,
    ephemeral?: boolean, // TODO: Актуально еще? Вроде сейчас всегда запись целиком должна отправляться
    hidden?: boolean, // TODO: Работа с ABAP
    required?: boolean,
    forceActive?: boolean,
    /**
     * @deprecated
     * Флаг, определяющий надо ли устанавливать значение переданное в forceValue
     * TODO: В Досье не используется, проверить на бэке и удалить
     */
    setForced?: boolean,
    drillDown?: string, // TODO: Переименовать чтоб было понятно что это url
    // TODO: Не DrillDownType потому что может получаться из ключа drillDownTypeKey,
    // значение которого ищется в слабо типизированном DataItem [fieldName: string]?
    // Сделать здесь енум, а по месту использования - приведение
    drillDownType?: string,
    /**
     * @deprecated
     * TODO: В Досье не используется, проверить на бэке и удалить
     */
    // dictionaryName?: string,
    values?: Array<{
        value: string,
        // настройки (иконка-направление(ANT) цвет) для иконки соответствующей значению
        icon: string
    }>
    filterValues?: Array<{ // словари для LOV'ов
        value: string
    }>,
    filterable?: boolean
}
