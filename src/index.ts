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
import {$do, types, ActionPayloadTypes, AnyAction} from './actions/actions'
import {Action, uActionTypesMap, uActionsMap, AnyOfMap, createActionCreators, createActionTypes} from './actions/actions-utils'

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
export {getFilters} from './utils/filters'
export {fetchBcDataAll} from './api/api'
const parseLocation = getParseLocationInstance
const buildLocation = getBuildLocationInstance

import {isViewNavigationItem, isViewNavigationCategory, isViewNavigationGroup} from './interfaces/navigation'
import {isWidgetFieldBlock, TableLikeWidgetTypes} from './interfaces/widget'

export {
    Provider,
    connect,
    $do,
    types as coreActions,
    ActionPayloadTypes,
    AnyAction,
    Action, uActionTypesMap, uActionsMap, AnyOfMap, createActionCreators, createActionTypes,
    historyObj,
    changeLocation,
    store,
    getStoreInstance,
    getLocaleProviderInstance,
    useTranslation,
    parseLocation,
    buildLocation,
    isViewNavigationItem,
    isViewNavigationCategory,
    isViewNavigationGroup,
    isWidgetFieldBlock,
    TableLikeWidgetTypes
}
