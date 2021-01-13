import { Observable } from 'rxjs/Observable'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import qs from 'query-string'
import { axiosInstance, getStoreInstance } from '../Provider'
import { TeslerResponse } from '../interfaces/objectMap'
import { $do } from '../actions/actions'

export interface ApiCallContext {
    widgetName: string
}

export const HEADERS = { Pragma: 'no-cache', 'Cache-Control': 'no-cache, no-store, must-revalidate' }

const createAxiosRequest = () => {
    return (
        axiosInstance ||
        axios.create({
            responseType: 'json',
            headers: {
                ...HEADERS
            }
        })
    )
}

const onResponseHook = <ResponsePayload>(response: AxiosResponse<ResponsePayload>) => {
    return response
}

/**
 * TODO
 *
 * @param value
 */
function redirectOccurred(value: AxiosResponse<TeslerResponse>) {
    if (value.data?.redirectUrl) {
        let redirectUrl = value.data.redirectUrl
        if (!redirectUrl.startsWith('/') && !redirectUrl.match('^http(.?)://')) {
            redirectUrl = `${window.location.pathname}#/${redirectUrl}`
        }
        if (redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
            redirectUrl = `${window.location.origin}${redirectUrl}`
        }
        window.location.replace(redirectUrl)
        return false
    }
    return true
}

/**
 * TODO
 *
 * @param error
 * @param callContext
 */
function onErrorHook(error: AxiosError, callContext?: ApiCallContext) {
    getStoreInstance().dispatch($do.apiError({ error, callContext }))
    throw error
}

const axiosForApi = {
    get: <ResponsePayload>(path: string, config: AxiosRequestConfig, callContext?: ApiCallContext) =>
        createAxiosRequest()
            .get<ResponsePayload>(path, config)
            .then(onResponseHook)
            .catch((reason: any) => {
                onErrorHook(reason, callContext)
            }) as Promise<AxiosResponse<ResponsePayload>>, // TODO: Как работает типизация для catch-ветки?
    put: <ResponsePayload>(path: string, data: any, callContext?: ApiCallContext) =>
        createAxiosRequest()
            .put<ResponsePayload>(path, data)
            .then(onResponseHook)
            .catch((reason: any) => {
                onErrorHook(reason, callContext)
            }) as Promise<AxiosResponse<ResponsePayload>>,
    post: <ResponsePayload>(path: string, data: any, config?: AxiosRequestConfig, callContext?: ApiCallContext) =>
        createAxiosRequest()
            .post(path, data, config)
            .then(onResponseHook)
            .catch((reason: any) => {
                onErrorHook(reason, callContext)
            }) as Promise<AxiosResponse<ResponsePayload>>,
    delete: <ResponsePayload>(path: string, callContext?: ApiCallContext) =>
        createAxiosRequest()
            .delete(path)
            .then(onResponseHook)
            .catch((reason: any) => {
                onErrorHook(reason, callContext)
            }) as Promise<AxiosResponse<ResponsePayload>>
}

/**
 * HTTP GET axios request wrapped into RxJS Observable.
 * Can be interrupted by `redirectOccured` function.
 *
 * @param path Endpoint url
 * @param headers Request headers
 * @param callContext Call context
 * @template ResponsePayload Response payload type
 */
const axiosGet = <ResponsePayload>(path: string, config: AxiosRequestConfig = {}, callContext?: ApiCallContext) => {
    return Observable.fromPromise(axiosForApi.get<ResponsePayload>(path, config, callContext))
        .takeWhile(redirectOccurred)
        .map(response => response.data)
}

/**
 * HTTP POST axios request wrapped into RxJS Observable.
 * Can be interrupted by `redirectOccured` function.
 *
 * @param path Endpoint url
 * @param headers Request headers
 * @param callContext Call context
 * @template ResponsePayload Response payload type
 */
const axiosPost = <ResponsePayload>(path: string, data: any, config: AxiosRequestConfig = {}, callContext?: ApiCallContext) => {
    return Observable.fromPromise(axiosForApi.post<ResponsePayload>(path, data, config, callContext))
        .takeWhile(redirectOccurred)
        .map(response => response.data)
}

/**
 * HTTP PUT axios request wrapped into RxJS Observable.
 * Can be interrupted by `redirectOccured` function.
 *
 * @param path Endpoint url
 * @param headers Request headers
 * @param callContext Call context
 * @template ResponsePayload Response payload type
 */
const axiosPut = <ResponsePayload>(path: string, data: any, callContext?: ApiCallContext) => {
    return Observable.fromPromise(axiosForApi.put<ResponsePayload>(path, data, callContext))
        .takeWhile(redirectOccurred)
        .map(response => response.data)
}

/**
 * HTTP DELETE axios request wrapped into RxJS Observable.
 * Can be interrupted by `redirectOccured` function.
 *
 * @param path Endpoint url
 * @param headers Request headers
 * @param callContext Call context
 * @template ResponsePayload Response payload type
 */
const axiosDelete = <ResponsePayload>(path: string, callContext?: ApiCallContext) => {
    return Observable.fromPromise(axiosForApi.delete<ResponsePayload>(path, callContext))
        .takeWhile(redirectOccurred)
        .map(response => response.data)
}

type QueryParamsMap = Record<string, string | number>

/**
 * Removes empty values from query parameters dictionary
 *
 * @param qso Query parameters dictionary
 */
function dropEmptyOrWrongParams(qso: QueryParamsMap) {
    const result: QueryParamsMap = { ...qso }

    return Object.keys(result).reduce((prev, paramKey) => {
        if (!prev[paramKey] && typeof prev[paramKey] !== 'number') {
            delete prev[paramKey]
        }
        return prev
    }, result)
}

/**
 * Extends url with query parameters control symbol (`?` or `&`)
 *
 * @param url Url with or without `?` symbol
 */
export function addTailControlSequences(url: string) {
    return !url.includes('?') ? url + '?' : url + '&'
}

/**
 * Extends url with query parameters
 *
 * @param url Url to extend
 * @param qso Query parameters dictionary
 */
export function applyParams(url: string, qso: QueryParamsMap) {
    if (!qso) {
        return url
    }
    return applyRawParams(url, dropEmptyOrWrongParams(qso))
}

/**
 * TODO
 *
 * @param url
 * @param qso
 */
export function applyRawParams(url: string, qso: Record<string, unknown>) {
    if (!qso) {
        return url
    }
    const result = qs.stringify(qso, { encode: true })
    return `${addTailControlSequences(url)}${result && `${result}`}`
}

/**
 * Get Tesler API file upload endpoint based on baseURL of axios instance
 *
 * Handles empty baseURL and trailing slash
 *
 * @returns File upload endpoint
 */
export function getFileUploadEndpoint() {
    if (!axiosInstance.defaults.baseURL) {
        return '/file'
    }
    return axiosInstance.defaults.baseURL.endsWith('/') ? `${axiosInstance.defaults.baseURL}file` : `${axiosInstance.defaults.baseURL}/file`
}

export { axiosForApi, axiosGet, axiosPut, axiosDelete, axiosPost }
