/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
 * Request to create a new data record
 *
 * @param screenName Screen name
 * @param bcUrl Business component cursors hierarchy
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
 * Request to save a data record
 *
 * @param screenName Screen name
 * @param bcUrl Business component cursors hierarchy
 * @param data Changed fields
 * @param context Call context
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
 * Request to delete a data record
 *
 * @param screenName Screen name
 * @param bcUrl Business component cursors hierarchy
 * @param context Call context
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
 * Request for a custom operation
 *
 * @param screenName Screen name
 * @param bcUrl Business component cursors hierarchy
 * @param data Changed fields
 * @param context Call context
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
 * Request to save an association (many-to-many relation)
 * - When request doest specify `bcUrl`, request body should have an array of records with a flag
 * to set or drop an association.
 * - When request does not specify `bcUrl`, request body should have a dictionary where key is `bcUrl`
 * for business component and value is an array of records with associate flag
 *
 * @param screenName Screen name
 * @param bcUrl Business component cursors hierarchy
 * @param data An array of records or a dictionary
 * @param params
 */
export function associate(
    screenName: string, bcUrl: string, data: AssociatedItem[] | Record<string, AssociatedItem[]>, params?: GetParamsMap
) {
    // TODO: Why Tesler API sends underscored `_associate` but expects `associated` in return?
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
 * Request row meta with preview of force-active changes
 *
 * @param screenName Screen name
 * @param bcUrl Business component cursors hierarchy
 * @param data Changed fields
 * @param params
 */
export function getRmByForceActive(screenName: string, bcUrl: string, data: PendingDataItem & { vstamp: number }, params?: GetParamsMap) {
    const url = applyParams(buildUrl`row-meta/${screenName}/` + bcUrl, params)
    return axiosPost<RowMetaResponse>(url, {data}).map((response) => response.data.row)
}
