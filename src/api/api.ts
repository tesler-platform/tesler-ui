import {applyParams, applyRawParams, axiosDelete, axiosGet, axiosPost, axiosPut, ApiCallContext} from '../utils/api'
import {buildUrl} from '../utils/history'
import {ObjectMap} from '../interfaces/objectMap'
import {BcDataResponse, DataItem, DataItemResponse, PendingDataItem} from '../interfaces/data'
import {RowMetaResponse} from '../interfaces/rowMeta'
import {AssociatedItem} from '../interfaces/operation'
import {Observable} from 'rxjs/Observable'

type GetParamsMap = ObjectMap<string | number>

/**
 * TODO
 *
 * @param path 
 * @param params 
 */
export function routerRequest(path: string, params: object) {
    return axiosGet(applyRawParams(path, params))
}

/**
 * TODO
 *
 * @param screenName 
 * @param bcUrl 
 * @param params 
 */
export function fetchBcData(screenName: string, bcUrl: string, params: GetParamsMap = {}) {
    const noLimit = params._limit === 0
    const queryStringObject = {
        ...params,
        _page: !noLimit && (('_page' in params) ? params._page : 1),
        _limit: !noLimit && (('_limit' in params) ? params._limit : 30)
    }
    const url = applyParams(buildUrl`data/${screenName}/` + bcUrl, queryStringObject)
    return axiosGet<BcDataResponse>(url)
}

/**
 * TODO
 *
 * @param screenName 
 * @param bcUrl 
 * @param params 
 */
export function fetchBcDataAll(screenName: string, bcUrl: string, params: GetParamsMap = {}) {
    let currentPage = 1

    return fetchBcData(screenName, bcUrl, {...params, _page: currentPage})
        .expand((response) => {
            return (response.hasNext)
                ? fetchBcData(screenName, bcUrl, {...params, _page: ++currentPage})
                : Observable.empty()
        })
        .reduce(
            (items, nextResponse) => {
                return [ ...items, ...nextResponse.data ]
            },
            [] as DataItem[]
        )
}

/**
 * TODO
 *
 * @param screenName 
 * @param bcUrl 
 * @param params 
 */
export function fetchRowMeta(screenName: string, bcUrl: string, params?: GetParamsMap) {
    const url = applyParams(
        buildUrl`row-meta/${screenName}/` + bcUrl,
        params
    )
    return axiosGet<RowMetaResponse>(url).map(response => response.data.row)
}

/**
 * Запрос создания новой записи
 *
 * @param screenName Имя скрина
 * @param bcUrl Путь к бизнес-компоненте, в которой создается запись
 * @param params
 */
export function newBcData(screenName: string, bcUrl: string, context: ApiCallContext, params?: GetParamsMap) {
    const url = applyParams(
        buildUrl`row-meta-new/${screenName}/` + bcUrl,
        params
    )
    return axiosGet<RowMetaResponse>(url, null, context).map(response => response.data)
}

/**
 * Запрос сохранения записи
 *
 * @param screenName Имя скрина
 * @param bcUrl Путь к сохраняемой записи в бизнес-компоненте
 * @param data Сохраняемая запись (измененные поля)
 * @param params
 */
export function saveBcData(
    screenName: string,
    bcUrl: string,
    data: PendingDataItem & { vstamp: number },
    context: ApiCallContext,
    params?: GetParamsMap
) {
    const url = applyParams(buildUrl`data/${screenName}/` + bcUrl, params)
    return axiosPut<DataItemResponse>(url, { data }, context).map(response => response.data)
}

/**
 * Запрос удаления записи
 *
 * @param screenName Имя скрина
 * @param bcUrl Путь к бизнес-компоненте, над которой выполняется операция
 * @param data Запись, над которой выполняется операция
 * @param params
 */
export function deleteBcData(screenName: string, bcUrl: string, context: ApiCallContext, params?: GetParamsMap) {
    const url = applyParams(
        buildUrl`data/${screenName}/` + bcUrl,
        params
    )
    return axiosDelete<DataItemResponse>(url, context).map(response => response.data)
}

/**
 * Запрос пользовательской бизнес-операции (кроме CRUD)
 *
 * @param screenName Имя скрина
 * @param bcUrl Путь к бизнес-компоненте, над которой выполняется операция
 * @param data Запись, над которой выполняется операция
 * @param params
 */
export function customAction(
    screenName: string,
    bcUrl: string,
    data: PendingDataItem & { vstamp: number },
    context: ApiCallContext,
    params?: GetParamsMap
) {
    const url = applyParams(
        buildUrl`custom-action/${screenName}/` + bcUrl,
        params
    )
    return axiosPost<DataItemResponse>(url, { data: data || {} }, null, context).map(response => response.data)
}

/**
 * Запрос на сохранение ассоциации (связь многие ко многим)
 * Если запрос идет с указанием bcUrl, то в теле должен быть просто массив записей с флагом, выставить им ассоциацию или снять ее.
 * Если запрос идет без указания bcUrl, то в теле должен быть словарь, где ключом выступает путь к бизнес-компоненте,
 * а значением - массив записей с флагом.
 *
 * @param screenName Имя скрина
 * @param bcUrl Путь к бизнес-компоненте, над которой выполняется операция
 * @param data Массив записей или словарь
 * @param params
 */
export function associate(
    screenName: string, bcUrl: string, data: AssociatedItem[] | Record<string, AssociatedItem[]>, params?: GetParamsMap
) {
    // TODO: А чегой-то оно с бэка приходит как _associate, а назад хочет associated?
    const processedData = Array.isArray(data)
        ? data.map(item => ({
            id: item.id,
            vstamp: item.vstamp,
            associated: item._associate,
        }))
        : data
    const url = applyParams(
        buildUrl`associate/${screenName}/` + bcUrl,
        params
    )
    return axiosPost<any>(url, processedData).map(response => response.data)
}

/**
 * Предоставление дельты изменений формы, запрос новой роу-меты и forcedValue's(рачетных/форсированных значений)
 *
 * @param screenName Имя скрина
 * @param bcUrl Путь к сохраняемой записи в бизнес-компоненте
 * @param data Сохраняемая запись (измененные поля)
 * @param params
 */
export function getRmByForceActive(screenName: string, bcUrl: string, data: PendingDataItem & { vstamp: number }, params?: GetParamsMap) {
    const url = applyParams(buildUrl`row-meta/${screenName}/` + bcUrl, params)
    return axiosPost<RowMetaResponse>(url, {data}).map((response) => response.data.row)
}
