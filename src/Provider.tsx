import React from 'react'
import { Action, Store } from 'redux'
import { Provider as ReduxProvider } from 'react-redux'
import { Route } from './interfaces/router'
import { ClientReducersMapObject, Store as CoreStore } from './interfaces/store'
import { Location } from 'history'
import { AxiosInstance } from 'axios'
import { initHistory } from './reducers/router'
import { initLocale } from './imports/i18n'
import { Resource, i18n } from 'i18next'
import CustomEpics, { AnyEpic } from './interfaces/customEpics'
import { CustomMiddlewares } from './interfaces/customMiddlewares'
import { defaultBuildLocation, defaultParseLocation } from './utils/history'
import { configureStore } from './utils/configureStore'
import { CustomWidgetDescriptor } from './interfaces/widget'
import extendPopupWidgetTypes from './utils/extendPopupWidgetTypes'

export interface ProviderProps<ClientState, ClientActions> {
    children: React.ReactNode
    customReducers?: ClientReducersMapObject<ClientState, ClientActions>
    customActions?: any
    customEpics?: CustomEpics | AnyEpic
    customMiddlewares?: CustomMiddlewares
    axiosInstance?: AxiosInstance
    customWidgets?: Record<string, CustomWidgetDescriptor>
    parseLocation?: (loc: Location<any>) => Route // TODO: Combine into configuration object
    buildLocation?: (route: Route) => string // TODO: Combine into configuration object
    useEpics?: boolean
    lang?: string
    langDictionary?: Resource
}

/**
 * @category Utils
 */
export let store: Store<CoreStore> = null
export let axiosInstance: AxiosInstance = null
export let parseLocation: (loc: Location<any>) => Route = defaultParseLocation
export let buildLocation: (route: Route) => string = defaultBuildLocation
export let localeProviderInstance: i18n = null

/**
 * TODO
 *
 * @category Utils
 */
export function getStoreInstance() {
    return store
}

/**
 * TODO
 *
 * @param storeInstance
 */
export function setStoreInstance(storeInstance: Store<CoreStore>) {
    store = storeInstance
}

/**
 * TODO
 */
export function getParseLocationInstance() {
    return parseLocation
}

/**
 * TODO
 */
export function getBuildLocationInstance() {
    return buildLocation
}

/**
 * @category Utils
 */
export function getLocaleProviderInstance() {
    return localeProviderInstance
}

/**
 *
 * @param props
 * @category Components
 */
const Provider = <ClientState extends Partial<CoreStore>, ClientActions extends Action<any>>(
    props: ProviderProps<ClientState, ClientActions>
) => {
    store = configureStore(props.customReducers, props.customEpics, props.useEpics, props.customMiddlewares)
    initHistory()
    localeProviderInstance = initLocale(props.lang || 'en', props.langDictionary)
    if (props.axiosInstance) {
        axiosInstance = props.axiosInstance
    }
    if (props.parseLocation) {
        parseLocation = props.parseLocation
    }
    if (props.buildLocation) {
        buildLocation = props.buildLocation
    }
    if (props.customWidgets) {
        extendPopupWidgetTypes(props.customWidgets)
    }
    return <ReduxProvider store={store}>{props.children}</ReduxProvider>
}

export default Provider
