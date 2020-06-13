import React from 'react'
import {Action, applyMiddleware, compose, createStore, Middleware, Store, StoreCreator} from 'redux'
import {Provider as ReduxProvider} from 'react-redux'
import {combineEpics, createEpicMiddleware} from 'redux-observable'
import {reducers as coreReducers} from './reducers/index'
import {epics as coreEpics} from './epics/index'
import {Route, RouteType} from './interfaces/router'
import {ClientReducersMapObject, CombinedReducersMapObject, CoreReducer, Store as CoreStore} from './interfaces/store'
import {Location} from 'history'
import {AnyAction, Epic} from './actions/actions'
import {AxiosInstance} from 'axios'
import qs from 'query-string'
import {initHistory} from './reducers/router'
import {combineReducers} from './utils/redux'
import {createAutoSaveMiddleware} from './middlewares/autosaveMiddleware'
import {createRequiredFieldsMiddleware} from './middlewares/requiredFieldsMiddleware'
import {createPreInvokeMiddleware} from './middlewares/preInvokeMiddleware'
import {initLocale} from './imports/i18n'
import {Resource, i18n} from 'i18next'

export interface ProviderProps<ClientState, ClientActions> {
    children: React.ReactNode,
    customReducers?: ClientReducersMapObject<ClientState, ClientActions>,
    customActions?: any,
    customEpics?: any,
    axiosInstance?: AxiosInstance
    parseLocation?: (loc: Location<any>) => Route, // TODO: демо, убрать
    buildLocation?: (route: Route) => string, // TODO: демо, убрать
    useEpics?: boolean,
    lang?: string,
    langDictionary?: Resource
}

export let store: Store<CoreStore> = null
export let axiosInstance: AxiosInstance = null
export let parseLocation: (loc: Location<any>) => Route = null
export let buildLocation: (route: Route) => string = null
export let localeProviderInstance: i18n = null

/**
 * TODO
 * 
 * @param storeCreator 
 */
function withLogger(storeCreator: StoreCreator): StoreCreator {
    return (window as any).devToolsExtension
        ? (window as any).devToolsExtension()(storeCreator)
        : storeCreator
}

/**
 * TODO
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
 * TODO
 */
export function getLocaleProviderInstance() {
    return localeProviderInstance
}

/**
 * TODO
 *
 * @param customReducers 
 * @param customEpics 
 * @param useEpics 
 */
export function configureStore<ClientState, ClientActions extends Action<any>>(
    customReducers = {} as ClientReducersMapObject<ClientState, ClientActions>,
    customEpics: Epic = null,
    useEpics: boolean = true
): Store<ClientState & CoreStore> {
    type CombinedActions = AnyAction & ClientActions
    // В случае совпадающих имен редьюсеров в ядре и на клиенте
    // сначала выполняется ядровой, и над получившимся состоянием выполняется клиентский
    // TODO: Вынести логику по объединению редьюсеров с типизацией
    const reducers = { ...coreReducers } as CombinedReducersMapObject<CoreStore & ClientState, CombinedActions>
    Object.keys(customReducers).forEach((reducerName: Extract<keyof ClientState, string>) => {
        const coreInitialState = coreReducers[reducerName]
        const reducerInitialState = {
            ...(coreInitialState || {} as ClientState),
            ...customReducers[reducerName].initialState,
        }

        if (reducers[reducerName as keyof ClientState] && !customReducers[reducerName].override) {
            const combined: CoreReducer<ClientState[keyof ClientState], CombinedActions> =
                (state = reducerInitialState, action, getStore) => {
                    const storeAfterCore = coreReducers[reducerName](state, action, getStore)
                    return customReducers[reducerName as keyof ClientState]
                    .reducer(storeAfterCore, action, getStore)
                }
            reducers[reducerName as keyof ClientState] = combined
        } else {
            reducers[reducerName as keyof ClientState] = customReducers[reducerName].reducer
        }
    })
    const middlewares: Middleware[] = [
        createAutoSaveMiddleware(),
        createRequiredFieldsMiddleware(),
        createPreInvokeMiddleware()
    ]
    if (useEpics) {
        const epics = combineEpics(coreEpics, customEpics)
        middlewares.push(createEpicMiddleware(epics))
    }
    return compose(
        applyMiddleware(...middlewares)
    )
    (withLogger(createStore))
    (combineReducers(reducers))
}

const Provider = <ClientState extends Partial<CoreStore>, ClientActions extends Action<any>, >
(props: ProviderProps<ClientState, ClientActions>) => {
    store = configureStore(props.customReducers, props.customEpics, props.useEpics)
    initHistory()
    localeProviderInstance = initLocale(props.lang || 'en', props.langDictionary)
    if (props.axiosInstance) {
        axiosInstance = props.axiosInstance
    }
    parseLocation = props.parseLocation || defaultParseLocation
    buildLocation = props.buildLocation || defaultBuildLocation
    return <ReduxProvider store={store}>
        {props.children}
    </ReduxProvider>
}

/**
 * TODO: Extract into separate module
 * @param loc 
 */
export function defaultParseLocation(loc: Location<any>): Route {
    let path: string = loc.pathname
    if (path.startsWith('/')) {
        path = path.substring(1)
    }
    if (path.endsWith('/')) {
        path = path.substring(0, path.length - 1)
    }
    const params = qs.parse(loc.search)
    const tokens = path.split('/').map(decodeURIComponent)

    // возможные варианты URL:
    // - / - страница по-умолчанию
    // - /screen/name/view/name/... - стандартная навигация
    // - /router/... - универсальная ссылка

    let type = RouteType.unknown
    let screenName = null
    let viewName = null
    let bcPath = null

    if (tokens.length > 0 && tokens[0] === 'router') {
        // универсальная ссылка
        type = RouteType.router
    } else if (tokens.length === 1) {
        // экран по-умолчанию
        type = RouteType.default
    } else if (tokens.length >= 2 && tokens[0] === 'screen') {
        // навигация
        let bcIndex = 2
        type = RouteType.screen
        screenName = tokens[1]
        if (tokens.length >= 4 && tokens[2] === 'view') {
            bcIndex += 2
            viewName = tokens[3]
        }
        bcPath = tokens.slice(bcIndex).map(encodeURIComponent).join('/')
    }

    return {
        type: type,
        path: path,
        params: params,
        screenName: screenName,
        viewName: viewName,
        bcPath: bcPath
    }
}

/**
 * TODO
 *
 * @param route 
 */
function defaultBuildLocation(route: Route) {
    return `/screen/${route.screenName}/view/${route.viewName}/${route.bcPath}`
}

export default Provider
