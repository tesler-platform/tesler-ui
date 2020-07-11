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

import * as util from './actions-utils'
import {ActionsObservable as rActionsObservable} from 'redux-observable'
import {Observable} from 'rxjs/Observable'
import {Store} from 'redux'
import {LoginResponse, SessionScreen} from '../interfaces/session'
import {Action as HistoryAction} from 'history'
import {DrillDownType, Route} from '../interfaces/router'
import {ViewMetaResponse, ApplicationError} from '../interfaces/view'
import {DataItem, MultivalueSingleValue, PendingDataItem, PickMap} from '../interfaces/data'
import {Store as CoreStore} from '../interfaces/store'
import {RowMeta} from '../interfaces/rowMeta'
import {ObjectMap, AppNotificationType} from '../interfaces/objectMap'
import {
    OperationPostInvokeAny,
    OperationTypeCrud,
    AssociatedItem,
    OperationErrorEntity,
    OperationPostInvokeConfirm,
    OperationPreInvoke
} from '../interfaces/operation'
import {BcFilter, BcSorter} from '../interfaces/filters'

const z = null as any

/**
 * ActionName: PayloadType = z
 * @param ActionName Name for an action (redux action "type") and corresponding action creater action
 * @param PayloadType Typescript description for payload
 * @property z Mandatory to prevent typescript from erasing unused class fields (@see https://github.com/microsoft/TypeScript/issues/12437)
 */
export class ActionPayloadTypes {

    /**
     * Browser location change occured (either through history listener or manually)
     *
     * @param rawLocation Change was requested to browser url
     * @param location Change was requested to precalculated application route
     * @param action History API type, usually 'PUSH'
     */
    changeLocation: {
        rawLocation?: string,
        location?: Route,
        action: HistoryAction
    } = z

    /**
     * Authentication request
     * 
     * @param login User-provided login
     * @param password User-provided password
     * @param role Optionally user can choose a role to authentificate with
     */
    login: {
        login: string,
        password: string,
        role?: string
    } = z

    /**
     * Login was successful
     */
    loginDone: LoginResponse = z

    /**
     * Login was unsuccesful
     * 
     * @param errorMsg Reason could be provided
     */
    loginFail: { errorMsg: string } = z

    /**
     * Logout was requested, manually or through stale session
     */
    logout: null = z

    /**
     * User succesfully was logged out
     */
    logoutDone: null = z

    /**
     * Request to change active screen was initiated
     * 
     * TODO: 2.0.0 Should be string (just the screen name) instead;
     * Initially this was due to `screen` reducer did not having access to `session` part of redux store
     * @param screen Request initiated with all the meta from login response  
     */
    selectScreen: {
        screen: SessionScreen
    } = z

    /**
     * Request to change active screen was unsuccesful (incorrect path, unknown screen, etc.)
     * 
     * @param screenName Which screen was requested originally
     */
    selectScreenFail: {
        screenName: string
    } = z

    /**
     * Request to change active view was initiated
     * 
     * TODO: 2.0.0 Should be string (just the view name) instead;
     * Initially this was due to `screen` and `view` reducers did not having access to `session` part of redux store
     */
    selectView: ViewMetaResponse = z

    /**
     * Request to change active view was unsuccesful (incorrect path, unknown screen, etc.)
     * 
     * @param selectViewFail Which view was requested originally
     */
    selectViewFail: {
        viewName: string
    } = z

    /**
     * Fetch data request for business component was initiated
     * 
     * @param widgetName What widget requires data (widget can only request its own data here)
     * 
     * @deprecated TODO: 2.0.0 Should be removed in favor of widgetName
     * @param bcName The business component to fetch data for
     * 
     * @deprecated TODO: 2.0.0 Should be all moved to separate hierarchy-specific action
     * @param depth The level of hierarchy to fetch data for
     * @param ignorePageLimit Page size should be ignored
     * @param keepDelta Pending changes should not be dropped when performing this request (due to
     * hierarchy expanging through cursor change, for same BC hierarchy this leads to data loss)
     */
    bcFetchDataRequest: {
        bcName: string,
        depth?: number,
        widgetName: string,
        ignorePageLimit?: boolean,
        keepDelta?: boolean
    } = z

    /**
     * Fetch data request request for specific pages range
     */
    bcFetchDataPages: {
        /**
         * The business component to fetch data for
         * @deprecated TODO: 2.0.0 Should be removed in favor of widgetName
         */
        bcName: string,
        /**
         * Fisrt page to fetch (default is 1)
         */
        widgetName: string,
        /**
         * What widget requires data (widget can only request its own data here)
         */
        from?: number,
        /**
         * Last page to fetch (default is current page)
         */
        to?: number
    } = z

    /**
     * Fetch data request for searchable fields
     * 
     * @param bcName The business component to fetch data for
     * @param searchSpec Search expression // TODO: Check format
     * @param searchString Value to search for
     */
    inlinePickListFetchDataRequest: {
        bcName: string,
        searchSpec: string,
        searchString: string
    } = z

    /**
     * Fetch data request was succesful
     * 
     * @param data Data records from response for this business component
     * @param bcUrl BC url with respect of parents cursors
     * @param hasNext If there are more data to fetch (other pages etc.)
     * 
     * @deprecated TODO: 2.0.0 Remove in favor of widgetName
     * @param bcName Business component that requested data
     * 
     * @deprecated TODO: 2.0.0 Should be all moved to separate hierarchy-specific action
     * @param depth For same BC hierarchies, the level which was requested
     */
    bcFetchDataSuccess: {
        bcName: string,
        data: DataItem[],
        depth?: number,
        bcUrl: string,
        hasNext?: boolean
    } = z

    /**
     * Fetch data request wac unsuccesful
     * 
     * @param bcName Business component that initiated data fetch
     * @param bcUrl BC url with respect of parents cursors
     *
     * @deprecated TODO: 2.0.0 Should be all moved to separate hierarchy-specific action
     * @param depth For same BC hierarchies, the level which was requested
     */
    bcFetchDataFail: {
        bcName: string,
        bcUrl: string,
        depth?: number,
    } = z

    /**
     * Fetch next chunk of data for table widgets with infinite scroll
     * 
     * @param bcName Business component that initiated data fetch
     * @param widgetName Widget that initiated row meta fetch
     */
    bcLoadMore: {
        bcName: string,
        widgetName?: string
    } = z

    /**
     * Fetch meta information for active record of business component
     * 
     * @param widgetName Widget that initiated row meta fetch
     * 
     * @deprecated TODO: 2.0.0 Remove in favor of widgetName
     * @param bcName Business component that initiated row meta fetch
     */
    bcFetchRowMeta: {
        bcName: string,
        widgetName: string
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param bcUrl
     * @param rowMeta
     * @param cursor
     */
    bcFetchRowMetaSuccess: {
        bcName: string,
        bcUrl: string,
        rowMeta: RowMeta,
        cursor?: string
    } = z

    /**
     * TODO
     * 
     * @param bcName
     */
    bcFetchRowMetaFail: {
        bcName: string
    } = z

    /**
     * TODO
     * 
     * @param bcName
     */
    bcNewData: {
        bcName: string
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param dataItem
     * @param bcUrl
     */
    bcNewDataSuccess: {
        bcName: string,
        dataItem: DataItem,
        bcUrl: string
    } = z

    /**
     * TODO
     * 
     * @param bName
     */

    /**
     * TODO
     * 
     * @param bcName
     */
    bcNewDataFail: {
        bcName: string
    } = z

    /**
     * TODO
     * 
     * @param bcName
     */
    bcDeleteDataFail: {
        bcName: string
    } = z

    /**
     * Request to change Force active field was unsuccesful
     *
     * @param bcName
     * @param bcUrl
     * @param viewError
     * @param entityError
     */
    forceActiveChangeFail: {
        bcName: string,
        bcUrl: string,
        viewError: string,
        entityError: OperationErrorEntity
    } = z

    /**
     * Perform CustomAction
     * 
     * @param bcName The business component to fetch data for
     * @param operationType Type of operation to be performed
     * @param widgetName What widget requires data
     * @param onSuccessAction Any other action
     * @param confirm params for confirm modal
     * @param bcKey key called bk
     */
    sendOperation: {
        bcName: string,
        operationType: OperationTypeCrud | string,
        widgetName: string,
        onSuccessAction?: AnyAction,
        confirm?: string,
        // TODO: Will not be optional in 2.0.0
        bcKey?: string,
        /**
         * @deprecated TODO: Remove in 2.0.0 in favor of sendOperationWithConfirm
         */
        confirmOperation?: OperationPreInvoke
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param bcUrl
     * @param viewError
     * @param entityError
     */
    sendOperationFail: {
        bcName: string,
        bcUrl: string,
        viewError: string,
        entityError: OperationErrorEntity
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param cursor
     */
    sendOperationSuccess: {
        bcName: string,
        cursor: string
    } = z

    /**
     * TODO
     * 
     * @param postInvoke
     * @param cursor
     * @param widgetName What widget initiated original operation, TODO: mandatory in 2.0.0
     * 
     * @deprecated TODO: Prefer widgetName instead (2.0.0)
     * @param bcName
     */
    processPostInvoke: {
        bcName: string,
        postInvoke: OperationPostInvokeAny,
        cursor?: string
        widgetName?: string
    } = z

    /**
     * Operation to perform preInvoke actions
     * 
     * @param bcName The business component to fetch data for
     * @param operationType Type of operation to be performed
     * @param widgetName What widget requires data
     * @param preInvoke the action that will be performed before the main operation
     */
    processPreInvoke: {
        bcName: string,
        operationType: string
        widgetName: string
        preInvoke: OperationPreInvoke
    } = z

    /**
     * Operation to perform postInvokeConfirm actions
     * 
     * @param bcName The business component to fetch data for
     * @param operationType Type of operation to be performed
     * @param widgetName What widget requires data
     * @param postInvokeConfirm the action that will be performed after the main operation and confirmation
     */
    processPostInvokeConfirm: {
        bcName: string,
        operationType: string
        widgetName: string
        postInvokeConfirm: OperationPostInvokeConfirm
    } = z

    /**
     * TODO
     * 
     * @param widgetName
     * @param bcName
     * @param cursor
     * @param fieldKey
     */
    userDrillDown: {
        widgetName: string,
        bcName: string,
        cursor: string,
        fieldKey: string
    } = z

    /**
     * TODO
     * 
     * @param bcUrl
     * @param bcName
     * @param cursor
     */
    userDrillDownSuccess: {
        bcUrl: string,
        bcName: string,
        cursor: string
    } = z

    /**
     * TODO
     * 
     * @param url
     * @param drillDownType
     * @param urlName
     * @param route
     */
    drillDown: {
        url: string,
        drillDownType?: DrillDownType,
        urlName?: string,
        route: Route,
        widgetName?: string,
    } = z

    /**
     * TODO
     * 
     * @param cursorsMap
     * @param keepDelta
     */
    bcChangeCursors: {
        cursorsMap: ObjectMap<string>,
        keepDelta?: boolean
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param depth
     * @param cursor
     */
    bcChangeDepthCursor: {
        bcName: string,
        depth: number,
        cursor: string
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param cursors
     * @param dataItems
     * @param disableRetry
     */
    changeDataItem: {
        bcName: string,
        cursor: string,
        dataItem: PendingDataItem,
        disableRetry?: boolean
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param cursors
     * @param dataItems
     */
    changeDataItems: {
        bcName: string,
        cursors: string[],
        dataItems: PendingDataItem[]
    } = z

    /**
     * TODO
     * 
     * @param currentRecordData
     * @param rowMeta
     * @param bcName
     * @param bcUrl
     * @param cursor
     */
    forceActiveRmUpdate: {
        /**
         * current data for record that initiated rowMeta fetch
         */
        currentRecordData: DataItem,
        rowMeta: RowMeta,
        bcName: string,
        bcUrl: string,
        cursor: string
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param calleeBCName
     * @param associateFieldKey
     * @param assocValueKey
     * @param active
     * @param isFilter
     */
    showViewPopup: {
        bcName: string,
        calleeBCName?: string,
        associateFieldKey?: string,
        assocValueKey?: string,
        active?: boolean,
        isFilter?: boolean
    } = z

    /**
     * TODO
     * 
     * @param bcName
     */
    closeViewPopup: {
        bcName: string
    } = z

    /**
     * TODO
     * 
     * @param map
     * @param bcName
     */
    viewPutPickMap: {
        map: PickMap,
        bcName: string,
    } = z

    /**
     * TODO
     */
    viewClearPickMap: null = z

    /**
     * TODO
     * 
     * @param bcNames
     * @param calleeBCName
     * @param associateFieldKey
     */
    saveAssociations: {
        bcNames: string[],
        /**
         * For usage outside of Popup (without opening multivalue)
         */
        calleeBcName?: string,
        associateFieldKey?: string
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param records
     */
    changeAssociations: {
        bcName: string,
        records?: DataItem[]
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param popupBcName
     * @param cursor
     * @param associateFieldKey
     * @param dataItem
     * @param removedItem
     */
    removeMultivalueTag: {
        bcName: string,
        popupBcName: string,
        cursor: string,
        associateFieldKey: string,
        dataItem: MultivalueSingleValue[],
        removedItem: MultivalueSingleValue
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param cursor
     * @param dataItem
     */
    bcSaveDataSuccess: {
        bcName: string,
        cursor: string,
        dataItem: DataItem
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param bcUrl
     * @param entityError
     * @param viewError
     */
    bcSaveDataFail: {
        bcName: string,
        bcUrl: string,
        entityError?: OperationErrorEntity,
        viewError?: string
    } = z

    /**
     * Save info about current operation for confirm modal
     * 
     * @param operation Current operation
     * @param confirmOperation Text for confirm modal
     */
    operationConfirmation: {
        operation: {
            bcName: string,
            operationType: OperationTypeCrud | string,
            widgetName: string,
        },
        confirmOperation: OperationPostInvokeConfirm
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param widgetName What widget requires data (widget can only request its own data here)
     */
    bcForceUpdate: {
        bcName: string,
        widgetName?: string
    } = z

    /**
     * TODO
     */
    uploadFile: null = z

    /**
     * TODO
     */
    uploadFileDone: null = z

    /**
     * TODO
     */
    uploadFileFailed: null = z

    /**
     * TODO
     * 
     * @param bcNames
     */
    bcCancelPendingChanges: {
        bcNames: string[]
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param cursor
     * @param ignoreChildrenPageLimit
     * @param keepDelta
     */
    bcSelectRecord: {
        bcName: string,
        cursor: string,
        ignoreChildrenPageLimit?: boolean,
        keepDelta?: boolean
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param depth
     * @param cursor
     */
    bcSelectDepthRecord: {
        bcName: string,
        depth: number,
        cursor: string,
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param widgetName
     * @param dataItem
     * @param assocValueKey
     */
    changeAssociation: {
        bcName: string,
        widgetName: string,
        dataItem: AssociatedItem,
        assocValueKey: string
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param depth
     * @param widgetName
     * @param dataItem
     * @param assocValueKey
     */
    changeAssociationSameBc: {
        bcName: string,
        depth: number,
        widgetName: string,
        dataItem: AssociatedItem,
        assocValueKey: string
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param depth
     * @param widgetName
     * @param dataItem
     * @param assocValueKey
     */
    changeAssociationFull: {
        bcName: string,
        depth: number,
        widgetName: string,
        dataItem: AssociatedItem,
        assocValueKey: string
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param assocValueKey
     * @param selected
     */
    changeChildrenAssociations: {
        bcName: string,
        assocValueKey: string,
        selected: boolean
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param depth
     * @param assocValueKey
     * @param selected
     */
    changeChildrenAssociationsSameBc: {
        bcName: string,
        depth: number,
        assocValueKey: string,
        selected: boolean
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param parentId
     * @param depth
     * @param assocValueKey
     * @param selected
     */
    changeDescendantsAssociationsFull: {
        bcName: string,
        parentId: string,
        depth: number,
        assocValueKey: string,
        selected: boolean
    } = z

    /**
     * TODO
     * 
     * @param bcNames
     */
    dropAllAssociations: {
        bcNames: string[]
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param depthFrom
     */
    dropAllAssociationsSameBc: {
        bcName: string,
        depthFrom: number
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param depth
     * @param dropDescendants
     */
    dropAllAssociationsFull: {
        bcName: string,
        depth: number,
        dropDescendants?: boolean
    } = z

    /**
     * TODO
     * 
     * @param path
     * @param params
     */
    handleRouter: {
        path: string,
        params: object
    } = z

    /**
     * TODO
     * 
     * @param widgetName
     * @param rowId
     * @param fieldKey
     */
    selectTableCellInit: {
        widgetName: string,
        rowId: string,
        fieldKey: string,
    } = z

    /**
     * TODO
     * 
     * @param widgetName
     * @param rowId
     * @param fieldKey
     */
    selectTableCell: {
        widgetName: string,
        rowId: string,
        fieldKey: string,
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param cursor
     * @param router
     */
    showAllTableRecordsInit: {
        bcName: string,
        cursor: string,
        /**
         * @deprecated Remove in 2.0 (accessible from the store)
         */
        route?: Route
    } = z

    /**
     * TODO
     * 
     * @param type
     * @param message
     */
    showNotification: {
        type: AppNotificationType,
        message: string
    } = z

    /**
     * TODO
     * 
     * @param id
     */
    closeNotification: {
        id: number
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param filter
     */
    bcAddFilter: {
        bcName: string,
        filter: BcFilter
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param filter
     */
    bcRemoveFilter: {
        bcName: string,
        filter: BcFilter
    } = z

    /**
     * Remove all filters at once
     *
     * @param bcName
     */
    bcRemoveAllFilters: {
        bcName: string
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param sorter
     */
    bcAddSorter: {
        bcName: string,
        sorter: BcSorter | BcSorter[]
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param sorter
     */
    bcRemoveSorter: {
        bcName: string,
        sorter: BcSorter
    } = z

    /**
     * TODO
     * 
     * @param bcName
     * @param page
     */
    bcChangePage: {
        bcName: string,
        page: number
    } = z

    /**
     * TODO
     * 
     * @param error
     */
    showViewError: {
        error: ApplicationError
    } = z

    /**
     * TODO
     */
    closeViewError: null = z

    /**
     * Close confirm modal window
     */
    closeConfirmModal: null = z

    /**
     * TODO
     */
    clearValidationFails: null = z

    /**
     * TODO
     * 
     * @param fileId
     */
    downloadFile: {
        fileId: string
    } = z

    /**
     * TODO
     *
     * @param url
     */
    downloadFileByUrl: {
        url: string
    } = z

    /**
     * TODO
     */
    emptyAction: null = z
}

// action-types
export const types = util.createActionTypes(new ActionPayloadTypes())
export const needSaveAction = (action: string) => {
    const actions: string[] = [
        types.changeLocation,
        types.userDrillDown,
        types.drillDown,
        types.selectTableCellInit,
        types.bcSelectRecord,
        types.showAllTableRecordsInit,
        types.bcChangePage,
        types.sendOperation
    ]

    return actions.indexOf(action) > -1
}
// action-creators
export const $do = util.createActionCreators(new ActionPayloadTypes())
export type ActionsMap = util.uActionsMap<ActionPayloadTypes>

/**
 * Any of the core actions
 */
export type AnyAction = util.AnyOfMap<ActionsMap> | {type: ' UNKNOWN ACTION '}

export interface ActionsObservable<T extends AnyAction> extends rActionsObservable<T> {
    /**
     * TODO
     *
     * @param key 
     */
    ofType<K extends keyof ActionPayloadTypes>(...key: K[]): ActionsObservable<ActionsMap[K]>
}

/**
 * Epic for any of core actions
 */
export type Epic = (action$: ActionsObservable<AnyAction>, store: Store<CoreStore>) => Observable<AnyAction>
