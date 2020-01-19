import './imports/shim'
import './imports/rxjs'

import {connect} from 'react-redux'
import {useTranslation} from 'react-i18next'
import Provider, {
    store,
    getStoreInstance,
    getParseLocationInstance,
    getBuildLocationInstance,
    getLocaleProviderInstance
} from './Provider'
import {$do, types} from './actions/actions'

export * from './components'
export * from './hooks'

import {historyObj, changeLocation} from './reducers/router'
export {
    axiosForApi,
    axiosGet, axiosPost, axiosPut, axiosDelete
} from './utils/api'
export {buildBcUrl} from './utils/strings'
export {combineReducers} from './utils/redux'
export {buildUrl, parseBcCursors} from './utils/history'
export {fetchBcDataAll} from './api/api'
const parseLocation = getParseLocationInstance
const buildLocation = getBuildLocationInstance

import {isViewNavigationItem, isViewNavigationGroup} from './interfaces/navigation'
import {isWidgetFieldBlock} from './interfaces/widget'

export {
    Provider,
    connect,
    $do,
    types as coreActions,
    historyObj,
    changeLocation,
    store,
    getStoreInstance,
    getLocaleProviderInstance,
    useTranslation,
    parseLocation,
    buildLocation,
    isViewNavigationItem,
    isViewNavigationGroup,
    isWidgetFieldBlock
}
