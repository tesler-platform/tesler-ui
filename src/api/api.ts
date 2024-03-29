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

import { applyParams, applyRawParams, axiosDelete, axiosGet, axiosPost, axiosPut, ApiCallContext } from '../utils/api'
import { buildUrl } from '../utils/history'
import { BcDataResponse, DataItem, DataItemResponse, PendingDataItem } from '../interfaces/data'
import { RowMetaResponse } from '../interfaces/rowMeta'
import { AssociatedItem } from '../interfaces/operation'
import { Observable } from 'rxjs/Observable'
import axios, { CancelToken } from 'axios'

type GetParamsMap = Record<string, string | number>

/**
 * TODO
 *
 * @param path
 * @param params
 * @category Tesler API Endpoints
 */
export function routerRequest(path: string, params: Record<string, unknown>) {
    return axiosGet(applyRawParams(path, params))
}

/**
 * Send request for BC data
 *
 * @param screenName
 * @param bcUrl
 * @param params
 * @param cancelToken
 * @category Tesler API Endpoints
 */
export function fetchBcData(screenName: string, bcUrl: string, params: GetParamsMap = {}, cancelToken?: CancelToken) {
    const noLimit = params._limit === 0
    const queryStringObject = {
        ...params,
        _page: !noLimit && ('_page' in params ? params._page : 1),
        _limit: !noLimit && ('_limit' in params ? params._limit : 30)
    }
    const url = applyParams(buildUrl`data/${screenName}/` + bcUrl, queryStringObject)
    return axiosGet<BcDataResponse>(url, { cancelToken })
}

/**
 * TODO
 *
 * @param screenName
 * @param bcUrl
 * @param params
 * @category Tesler API Endpoints
 */
export function fetchBcDataAll(screenName: string, bcUrl: string, params: GetParamsMap = {}) {
    let currentPage = 1

    return fetchBcData(screenName, bcUrl, { ...params, _page: currentPage })
        .expand(response => {
            return response.hasNext ? fetchBcData(screenName, bcUrl, { ...params, _page: ++currentPage }) : Observable.empty()
        })
        .reduce((items, nextResponse) => {
            return [...items, ...nextResponse.data]
        }, [] as DataItem[])
}

/**
 * Send request for `row-meta`
 *
 * @param screenName
 * @param bcUrl
 * @param params
 * @param cancelToken
 * @category Tesler API Endpoints
 */
export function fetchRowMeta(screenName: string, bcUrl: string, params?: GetParamsMap, cancelToken?: CancelToken) {
    const url = applyParams(buildUrl`row-meta/${screenName}/` + bcUrl, params)
    return axiosGet<RowMetaResponse>(url, { cancelToken }).map(response => response.data.row)
}

/**
 * Request to create a new data record
 *
 * @param screenName Screen name
 * @param bcUrl Business component cursors hierarchy
 * @param params
 * @category Tesler API Endpoints
 */
export function newBcData(screenName: string, bcUrl: string, context: ApiCallContext, params?: GetParamsMap) {
    const url = applyParams(buildUrl`row-meta-new/${screenName}/` + bcUrl, params)
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
 * @category Tesler API Endpoints
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
 * @category Tesler API Endpoints
 */
export function deleteBcData(screenName: string, bcUrl: string, context: ApiCallContext, params?: GetParamsMap) {
    const url = applyParams(buildUrl`data/${screenName}/` + bcUrl, params)
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
 * @category Tesler API Endpoints
 */
export function customAction(screenName: string, bcUrl: string, data: Record<string, any>, context: ApiCallContext, params?: GetParamsMap) {
    const url = applyParams(buildUrl`custom-action/${screenName}/` + bcUrl, params)
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
 * @category Tesler API Endpoints
 */
export function associate(
    screenName: string,
    bcUrl: string,
    data: AssociatedItem[] | Record<string, AssociatedItem[]>,
    params?: GetParamsMap
) {
    // TODO: Why Tesler API sends underscored `_associate` but expects `associated` in return?
    const processedData = Array.isArray(data)
        ? data.map(item => ({
              id: item.id,
              vstamp: item.vstamp,
              associated: item._associate
          }))
        : data
    const url = applyParams(buildUrl`associate/${screenName}/` + bcUrl, params)
    return axiosPost<any>(url, processedData).map(response => response.data)
}

/**
 * Request row meta with preview of force-active changes
 *
 * @param screenName Screen name
 * @param bcUrl Business component cursors hierarchy
 * @param data Changed fields
 * @param params
 * @category Tesler API Endpoints
 */
export function getRmByForceActive(screenName: string, bcUrl: string, data: PendingDataItem & { vstamp: number }, params?: GetParamsMap) {
    const url = applyParams(buildUrl`row-meta/${screenName}/` + bcUrl, params)
    return axiosPost<RowMetaResponse>(url, { data }).map(response => response.data.row)
}

/**
 * Request for refresh screens, views and widgets meta
 *
 * @category Tesler API Endpoints
 */
export function refreshMeta() {
    return axiosGet(buildUrl`bc-registry/refresh-meta`)
}

/**
 * Request for role switching
 *
 * @param role Code of new role
 * @category Tesler API Endpoints
 */
export function loginByRoleRequest(role: string) {
    return axiosGet(buildUrl`login?role=${role}`)
}

/**
 * Returns new cancel token and cancel callback
 */
export function createCanceler() {
    let cancel: () => void
    const cancelToken = new axios.CancelToken(c => {
        cancel = c
    })
    return {
        cancel,
        cancelToken
    }
}
