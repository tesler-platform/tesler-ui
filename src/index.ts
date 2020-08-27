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
import {historyObj, changeLocation} from './reducers/router'
import {
    axiosForApi,
    axiosGet, axiosPost, axiosPut, axiosDelete
} from './utils/api'
import {buildBcUrl} from './utils/strings'
import {combineReducers} from './utils/redux'
import {buildUrl, parseBcCursors} from './utils/history'
import {getFilters} from './utils/filters'
import {matchOperationRole, flattenOperations} from './utils/operations'
import {isViewNavigationItem, isViewNavigationCategory, isViewNavigationGroup} from './interfaces/navigation'
import {isWidgetFieldBlock, TableLikeWidgetTypes} from './interfaces/widget'
const parseLocation = getParseLocationInstance
const buildLocation = getBuildLocationInstance

/**
 * This is our public API.
 * 
 * Any code that should be available to a client application should be exported from here.
 * Then it becomes available for import from client application:
 * import {matchOperationRole} from `@tesler-ui/core`
 * 
 * The only exception is typings (they are imported directly).
 * 
 * Keep in mind that every item here MUST BE backward-compatible until the next major release,
 * so be reasonable and responsible when introducing changes or new items.
 * 
 * Every block has `Stable` and `Unstable` sections. Items in `Stable` sections have shown themself pretty
 * robust and not likely be subjects of revisions. Items in `Unstable` sections require your attention in the
 * next major release.
 */

/**
 * Tesler UI `instance`
 * 
 * TODO: 2.0.0 sh
 */
export {
    // Stable
    Provider,
    // Unstable
    connect,
    store,
    getStoreInstance,
    combineReducers
}

/**
 * Components
 * 
 * Make sure every component has backward-compatible props, i.e. no new mandatory props or changing types
 */
export * from './components'

/**
 * Hooks
 */
export * from './hooks'

/**
 * API endpoints
 */
export * from './api'

/**
 * Router
 * 
 * Router API is not looking good at the moment
 */
export {
    // Unstable
    historyObj,
    changeLocation,
    parseLocation,
    buildLocation,
    buildUrl,
    parseBcCursors
}

/**
 * API helpers
 */
export {
    // Stable
    axiosGet,
    axiosPost,
    axiosPut,
    axiosDelete,
    // Unstable
    axiosForApi
}

/**
 * Helpers
 */
export {
    // Stable
    matchOperationRole,
    getFilters,
    // Unstable
    buildBcUrl,
    flattenOperations,
    TableLikeWidgetTypes
}

/**
 * Action helpers
 *
 * TODO: Check how much we can remove in 2.0.0 with introduction of @tesler-ui/cra-template-typescript
 */
export {
    // Stable
    types as coreActions,
    $do,
    // Unstable
    ActionPayloadTypes,
    AnyAction,
    Action,
    uActionTypesMap,
    uActionsMap,
    AnyOfMap,
    createActionCreators,
    createActionTypes
}

/**
 * i18n helpers
 */
export {
    // Stable
    useTranslation,
    // Unstable
    getLocaleProviderInstance,
}

/**
 * Type guards
 */
export {
    // Stable
    isViewNavigationItem,
    isViewNavigationGroup,
    isWidgetFieldBlock,
    /**
     * @deprecated
     */
    isViewNavigationCategory,
}

/**
 * Epics implementations
 */
export {sendOperationEpicImpl} from './epics/view'
