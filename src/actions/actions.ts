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
import { ActionsObservable as rActionsObservable } from 'redux-observable'
import { Observable } from 'rxjs/Observable'
import { Store } from 'redux'
import { LoginResponse, SessionScreen, PendingRequest } from '../interfaces/session'
import { Action as HistoryAction } from 'history'
import { DrillDownType, Route } from '../interfaces/router'
import { ViewMetaResponse, ApplicationError, PopupType } from '../interfaces/view'
import { DataItem, MultivalueSingleValue, PendingDataItem, PickMap } from '../interfaces/data'
import { Store as CoreStore } from '../interfaces/store'
import { RowMeta } from '../interfaces/rowMeta'
import { AppNotificationType } from '../interfaces/objectMap'
import {
    OperationPostInvokeAny,
    OperationTypeCrud,
    AssociatedItem,
    OperationErrorEntity,
    OperationPostInvokeConfirm,
    OperationPreInvoke
} from '../interfaces/operation'
import { BcFilter, BcSorter } from '../interfaces/filters'
import { AxiosError } from 'axios'
import { ApiCallContext } from '../utils/api'

const z = null as any

/**
 * ActionName: PayloadType = z
 *
 * @param ActionName Name for an action (redux action "type") and corresponding action creater action
 * @param PayloadType Typescript description for payload
 * @property z Mandatory to prevent typescript from erasing unused class fields (@see https://github.com/microsoft/TypeScript/issues/12437)
 * @category Actions
 */
export class ActionPayloadTypes {
    /**
     * Browser location change occured (either through history listener or manually)
     */
    changeLocation: {
        /**
         * Change was requested to browser url
         */
        rawLocation?: string
        /**
         * Change was requested to precalculated application route
         */
        location?: Route
        /**
         * History API type, usually 'PUSH'
         */
        action: HistoryAction
    } = z

    /**
     * Authentication request
     */
    login: {
        /**
         * User-provided login
         */
        login: string
        /**
         * User-provided password
         */
        password: string
        /**
         * Optionally user can choose a role to authentificate with
         */
        role?: string
    } = z

    /**
     * Login was successful
     */
    loginDone: LoginResponse = z

    /**
     * Login was unsuccesful
     */
    loginFail: {
        /**
         * Reason could be provided
         */
        errorMsg: string
    } = z

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
     *
     * Initially this was due to `screen` reducer did not having access to `session` part of redux store
     */
    selectScreen: {
        /**
         * Request initiated with all the meta from login response
         */
        screen: SessionScreen
    } = z

    /**
     * Request to change active screen was unsuccesful (incorrect path, unknown screen, etc.)
     */
    selectScreenFail: {
        /**
         * Which screen was requested originally
         */
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
     */
    bcFetchDataRequest: {
        /**
         * The business component to fetch data for
         *
         * @deprecated TODO: 2.0.0 Should be removed in favor of widgetName
         */
        bcName?: string
        /**
         * The level of hierarchy to fetch data for
         *
         * @deprecated Do not use; TODO: Will be removed in 2.0.0
         */
        depth?: number
        /**
         * What widget requires data (widget can only request its own data here)
         */
        widgetName: string
        /**
         * Page size should be ignored
         *
         * Used mostly for hierarchy widgets which does not have controls
         * for navigating between pages aside of root level.
         */
        ignorePageLimit?: boolean
        /**
         * Pending changes should not be dropped when performing this request
         * (due to hierarchy expanging through cursor change, for same BC hierarchy this leads to data loss)
         */
        keepDelta?: boolean
    } = z

    /**
     * Fetch data request request for specific pages range
     */
    bcFetchDataPages: {
        /**
         * The business component to fetch data for
         *
         * @deprecated TODO: 2.0.0 Should be removed in favor of widgetName
         */
        bcName: string
        /**
         * Fisrt page to fetch (default is 1)
         */
        widgetName: string
        /**
         * What widget requires data (widget can only request its own data here)
         */
        from?: number
        /**
         * Last page to fetch (default is current page)
         */
        to?: number
    } = z

    /**
     * Fetch data request for searchable fields
     */
    inlinePickListFetchDataRequest: {
        /**
         * The business component to fetch data for
         */
        bcName: string
        /**
         * Search expression // TODO: Check format
         */
        searchSpec: string
        /**
         * Value to search for
         */
        searchString: string
    } = z

    /**
     * Fetch data request was succesful
     */
    bcFetchDataSuccess: {
        /**
         * Business component that requested data
         *
         * @deprecated TODO: 2.0.0 Remove in favor of widgetName
         */
        bcName: string
        /**
         * Data records from response for this business component
         */
        data: DataItem[]
        /**
         * For same BC hierarchies, the level which was requested
         *
         * @deprecated TODO: 2.0.0 Should be all moved to separate hierarchy-specific action
         */
        depth?: number
        /**
         * BC url with respect of parents cursors
         */
        bcUrl: string
        /**
         * If there are more data to fetch (other pages etc.)
         */
        hasNext?: boolean
    } = z

    /**
     * Fetch data request wac unsuccesful
     */
    bcFetchDataFail: {
        /**
         * Business component that initiated data fetch
         */
        bcName: string
        /**
         * BC url with respect of parents cursors
         */
        bcUrl: string
        /**
         * For same BC hierarchies, the level which was requested
         *
         * @deprecated TODO: 2.0.0 Should be all moved to separate hierarchy-specific action
         */
        depth?: number
    } = z

    /**
     * Fetch next chunk of data for table widgets with infinite scroll
     */
    bcLoadMore: {
        /**
         * Business component that initiated data fetch
         */
        bcName: string
        /**
         * Widget that initiated row meta fetch
         */
        widgetName?: string
    } = z

    /**
     * Fetch meta information for active record of business component
     */
    bcFetchRowMeta: {
        /**
         *
         * Business component that initiated row meta fetch
         *
         * @deprecated TODO: 2.0.0 Remove in favor of widgetName
         */
        bcName: string
        /**
         * Widget that initiated row meta fetch
         */
        widgetName: string
    } = z

    /**
     * Puts row meta received from Tesler API to the store.
     *
     * Updates values in `data` store slice with new values from row meta when possible.
     */
    bcFetchRowMetaSuccess: {
        /**
         * Business component that initiated row meta fetch
         */
        bcName: string
        /**
         * Path to BC with respect to ancestors BC and their cursors
         */
        bcUrl: string
        /**
         * Row meta returned by Tesler API
         */
        rowMeta: RowMeta
        /**
         * Cursor for a record that initiated row meta fetch.
         *
         * Can be empty (e.g. BC has no records) or will be set to new id for `create` operation.
         */
        cursor?: string
    } = z

    /**
     * Fetch request for row meta was unsuccesful
     */
    bcFetchRowMetaFail: {
        /**
         * Business component initiated row meta fetch
         */
        bcName: string
    } = z

    /**
     * @deprecated Not used; `sendOperation` with `create` role is used instead
     *
     * TODO: Remove in 2.0.0
     */
    bcNewData: {
        /**
         * Business component for which to create a new record
         */
        bcName: string
    } = z

    /**
     * Put new record draft to `data` store slice
     */
    bcNewDataSuccess: {
        /**
         * Business component for which new record was created
         */
        bcName: string
        /**
         * New record with `id` returned by Tesler API and vstamp = -1 (denoting a record draft)
         */
        dataItem: DataItem
        /**
         * Path to BC with respect to ancestors BC and their cursors
         */
        bcUrl: string
    } = z

    /**
     * Dispatched when record creation failed
     */
    bcNewDataFail: {
        /**
         * Business component for which record creation failed
         */
        bcName: string
    } = z

    /**
     * Delete record request was
     */
    bcDeleteDataFail: {
        /**
         * Business component initiated delete record
         */
        bcName: string
    } = z

    /**
     * Request to change Force active field was unsuccesful
     */
    forceActiveChangeFail: {
        /**
         * Business component initiated force active change
         */
        bcName: string
        /**
         * Cursors hierarchy at the time of force active change to
         */
        bcUrl: string
        /**
         * Error to show in modal
         */
        viewError: string
        /**
         * Validation errors on fields
         */
        entityError: OperationErrorEntity
    } = z

    /**
     * Perform CustomAction
     */
    sendOperation: {
        /**
         * The business component to fetch data for
         */
        bcName: string
        /**
         * Type of operation to be performed
         */
        operationType: OperationTypeCrud | string
        /**
         * What widget requires data
         */
        widgetName: string
        /**
         * Any other action
         */
        onSuccessAction?: AnyAction
        /**
         * params for confirm modal
         */
        confirm?: string
        /**
         * key called bk
         *
         * @deprecated TODO: Remove in 2.0.0
         */
        bcKey?: string
        /**
         * @deprecated TODO: Remove in 2.0.0 in favor of sendOperationWithConfirm
         */
        confirmOperation?: OperationPreInvoke
    } = z

    /**
     * Send operation request was unsuccessful
     */
    sendOperationFail: {
        /**
         * Business component initiated send operation request
         */
        bcName: string
        /**
         * Cursors hierarchy at the time when request was fired
         */
        bcUrl: string
        /**
         * Error to show in modal
         */
        viewError: string
        /**
         * Validation errors on fields
         */
        entityError: OperationErrorEntity
    } = z

    /**
     * Send operation request was successful
     */
    sendOperationSuccess: {
        /**
         * Business component initiated the request
         */
        bcName: string
        /**
         * Cursor which initiated the request
         */
        cursor: string
    } = z

    /**
     * TODO
     */
    processPostInvoke: {
        /**
         * @deprecated TODO: Prefer widgetName instead (2.0.0)
         */
        bcName: string
        postInvoke: OperationPostInvokeAny
        cursor?: string
        /**
         * What widget initiated original operation, TODO: mandatory in 2.0.0
         */
        widgetName?: string
    } = z

    /**
     * Operation to perform preInvoke actions
     */
    processPreInvoke: {
        /**
         * The business component to fetch data for
         */
        bcName: string
        /**
         * Type of operation to be performed
         */
        operationType: string
        /**
         * What widget requires data
         */
        widgetName: string
        /**
         * Action that will be performed before the main operation
         */
        preInvoke: OperationPreInvoke
    } = z

    /**
     * Operation to perform postInvokeConfirm actions
     */
    processPostInvokeConfirm: {
        /**
         * The business component to fetch data for
         */
        bcName: string
        /**
         * Type of operation to be performed
         */
        operationType: string
        /**
         * What widget requires data
         */
        widgetName: string
        /**
         * Action that will be performed after the main operation and confirmation
         */
        postInvokeConfirm: OperationPostInvokeConfirm
    } = z

    /**
     * TODO
     */
    userDrillDown: {
        widgetName: string
        bcName: string
        cursor: string
        fieldKey: string
    } = z

    /**
     * TODO
     */
    userDrillDownSuccess: {
        bcUrl: string
        bcName: string
        cursor: string
    } = z

    /**
     * TODO
     */
    drillDown: {
        url: string
        drillDownType?: DrillDownType
        urlName?: string
        route: Route
        widgetName?: string
    } = z

    /**
     * TODO
     */
    bcChangeCursors: {
        cursorsMap: Record<string, string>
        keepDelta?: boolean
    } = z

    /**
     * Sets a cursor for the specified depth level of hierarchy widget
     * builded around a single business component.
     */
    bcChangeDepthCursor: {
        /**
         * Business component for the hierarchy widget
         */
        bcName: string
        /**
         * Depth level for which cursor is set
         */
        depth: number
        /**
         * Cursor set for specific depth level of the hierarchy widget.
         *
         * Controls the collapsed state of the record and which data are fetched for the next level of hierarchy
         */
        cursor: string
    } = z

    /**
     * TODO
     */
    changeDataItem: {
        bcName: string
        cursor: string
        dataItem: PendingDataItem
        disableRetry?: boolean
    } = z

    /**
     * TODO
     */
    changeDataItems: {
        bcName: string
        cursors: string[]
        dataItems: PendingDataItem[]
    } = z

    /**
     * TODO
     */
    forceActiveRmUpdate: {
        /**
         * current data for record that initiated rowMeta fetch
         */
        currentRecordData: DataItem
        rowMeta: RowMeta
        bcName: string
        bcUrl: string
        cursor: string
    } = z

    /**
     * TODO
     */
    showViewPopup: {
        /**
         * BC name of popup widget
         *
         * @deprecated TODO: Remove in 2.0.0 in favor of widget name
         */
        bcName: string
        /**
         * Name of popup widget
         */
        widgetName?: string
        /**
         * It's BC name of `caller` widget actually
         *
         * @deprecated TODO: Remove in 2.0.0 in favor of widget name
         */
        calleeBCName?: string
        /**
         * Name of `caller` widget actually
         *
         * TODO: 2.0.0 : Rename to `callerWidgetName`
         */
        calleeWidgetName?: string
        /**
         * Popup widget field key associated to `assocValueKey` of caller widget
         */
        associateFieldKey?: string
        /**
         * Caller widget field key associated to `associateFieldKey` of popup widget
         */
        assocValueKey?: string
        /**
         * If `true` then backend's method of association is used
         */
        active?: boolean
        /**
         * Whether popup is used as filter
         */
        isFilter?: boolean
        /**
         * Type of popup
         */
        type?: PopupType
    } = z

    /**
     * TODO
     */
    showFileUploadPopup: {
        /**
         * Name of the widget that initiated popup opening
         */
        widgetName: string
    } = z

    /**
     * Closes currently active popup on view
     */
    closeViewPopup: {
        /**
         * Not used
         *
         * @deprecated TODO: Will be removed in 2.0.0
         */
        bcName?: string
    } = z

    /**
     * TODO
     */
    viewPutPickMap: {
        map: PickMap
        bcName: string
    } = z

    /**
     * TODO
     */
    viewClearPickMap: null = z

    /**
     * TODO
     */
    saveAssociations: {
        bcNames: string[]
        /**
         * For usage outside of Popup (without opening multivalue)
         */
        calleeBcName?: string
        associateFieldKey?: string
    } = z

    /**
     * Sets intermediate state for association widget by storing associated records in pseudo-business component.
     *
     * Name for this pseudo-BC is formed as `${bcName}Delta`.
     */
    changeAssociations: {
        /**
         * Assoc widget's business component
         */
        bcName: string
        /**
         * Records that marked as `associated` for this widget
         *
         * TODO: Will be mandatory in 2.0.0
         */
        records?: DataItem[]
    } = z

    /**
     * TODO
     */
    removeMultivalueTag: {
        bcName: string
        popupBcName: string
        cursor: string
        associateFieldKey: string
        dataItem: MultivalueSingleValue[]
        removedItem: MultivalueSingleValue
    } = z

    /**
     * TODO
     */
    bcSaveDataSuccess: {
        bcName: string
        cursor: string
        dataItem: DataItem
    } = z

    /**
     * TODO
     */
    bcSaveDataFail: {
        bcName: string
        bcUrl: string
        entityError?: OperationErrorEntity
        viewError?: string
    } = z

    /**
     * Save info about current operation for confirm modal
     */
    operationConfirmation: {
        /**
         * Current operation
         */
        operation: {
            bcName: string
            operationType: OperationTypeCrud | string
            widgetName: string
        }
        /**
         * Text for confirm modal
         */
        confirmOperation: OperationPostInvokeConfirm
    } = z

    /**
     * Manually update business component by fetching its data and and row meta
     */
    bcForceUpdate: {
        /**
         * @deprecated Will be removed in 2.0.0 in favor of `widgetName`
         */
        bcName: string
        /**
         * What widget requires data (widget can only request its own data here)
         *
         * TODO: Will be mandatory in 2.0.0
         */
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
     */
    bcCancelPendingChanges: {
        bcNames: string[]
    } = z

    /**
     * TODO
     */
    bcSelectRecord: {
        bcName: string
        cursor: string
        ignoreChildrenPageLimit?: boolean
        keepDelta?: boolean
    } = z

    /**
     * Wrapper action to sets a cursor for the specified depth level of hierarchy widget
     * builded around a single business component and fetch children for that record.
     *
     * @deprecated Do not use. TODO: Will be removed in 2.0.0
     */
    bcSelectDepthRecord: {
        /**
         * Business component for the hierarchy widget
         */
        bcName: string
        /**
         * Depth level for which cursor is set
         */
        depth: number
        /**
         * Cursor set for specific depth level of the hierarchy widget.
         *
         * Controls the collapsed state of the record and which data are fetched for the next level of hierarchy
         */
        cursor: string
    } = z

    /**
     * TODO
     */
    changeAssociation: {
        bcName: string
        widgetName: string
        dataItem: AssociatedItem
        assocValueKey: string
    } = z

    /**
     * TODO
     */
    changeAssociationSameBc: {
        bcName: string
        depth: number
        widgetName: string
        dataItem: AssociatedItem
        assocValueKey: string
    } = z

    /**
     * TODO
     */
    changeAssociationFull: {
        bcName: string
        depth: number
        widgetName: string
        dataItem: AssociatedItem
        /**
         * @deprecated TODO: Remove in 2.0.0 in favor of store.view.popupData.assocValueKey instead
         */
        assocValueKey?: string
    } = z

    /**
     * TODO
     */
    changeChildrenAssociations: {
        bcName: string
        assocValueKey: string
        selected: boolean
    } = z

    /**
     * TODO
     */
    changeChildrenAssociationsSameBc: {
        bcName: string
        depth: number
        assocValueKey: string
        selected: boolean
    } = z

    /**
     * TODO
     */
    changeDescendantsAssociationsFull: {
        bcName: string
        parentId: string
        depth: number
        assocValueKey: string
        selected: boolean
    } = z

    /**
     * TODO
     */
    dropAllAssociations: {
        bcNames: string[]
    } = z

    /**
     * TODO
     */
    dropAllAssociationsSameBc: {
        bcName: string
        depthFrom: number
    } = z

    /**
     * TODO
     */
    dropAllAssociationsFull: {
        bcName: string
        depth: number
        dropDescendants?: boolean
    } = z

    /**
     * For server side routing where {@link RouteType.router | routes are handled by Tesler API endpoint}, this action is dispatched
     * to process requested route.
     */
    handleRouter: {
        /**
         * An URL that will be passed to Tesler API router endpoint
         */
        path: string
        /**
         * AJAX request parameters for the requests
         */
        params: Record<string, unknown>
    } = z

    /**
     * TODO
     */
    selectTableCellInit: {
        widgetName: string
        rowId: string
        fieldKey: string
    } = z

    /**
     * TODO
     */
    selectTableCell: {
        widgetName: string
        rowId: string
        fieldKey: string
    } = z

    /**
     * TODO
     */
    showAllTableRecordsInit: {
        bcName: string
        cursor: string
        /**
         * @deprecated Remove in 2.0 (accessible from the store)
         */
        route?: Route
    } = z

    /**
     * TODO
     */
    showNotification: {
        type: AppNotificationType
        message: string
    } = z

    /**
     * TODO
     */
    closeNotification: {
        id: number
    } = z

    /**
     * TODO
     */
    bcAddFilter: {
        bcName: string
        filter: BcFilter
    } = z

    /**
     * TODO
     */
    bcRemoveFilter: {
        bcName: string
        filter: BcFilter
    } = z

    /**
     * Remove all filters at once
     */
    bcRemoveAllFilters: {
        bcName: string
    } = z

    /**
     * TODO
     */
    bcAddSorter: {
        bcName: string
        sorter: BcSorter | BcSorter[]
    } = z

    /**
     * TODO
     */
    bcRemoveSorter: {
        bcName: string
        sorter: BcSorter
    } = z

    /**
     * Fetches data for the new page of business component, replacing existing data
     */
    bcChangePage: {
        /**
         * Business component changing the page
         *
         * @deprecated TODO: Will be removed in 2.0.0 in favor of `widgetNam`
         */
        bcName: string
        /**
         * Requested page number
         */
        page: number
        /**
         * Widget changing the page
         */
        widgetName?: string
    } = z

    /**
     * TODO
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
     */
    downloadFile: {
        fileId: string
    } = z

    /**
     * TODO
     */
    downloadFileByUrl: {
        url: string
    } = z

    /**
     * Save uploaded files to the widget
     */
    bulkUploadFiles: {
        /**
         * Ids of uploaded files
         */
        fileIds: string[]
    } = z

    /**
     * An error occured during API request
     */
    apiError: {
        /**
         * Axios error object
         */
        error: AxiosError
        /**
         * Request context
         */
        callContext: ApiCallContext
    } = z

    /**
     * Fires for specific HTTP status code
     */
    httpError: {
        /**
         * Status code for failed request caught by `onErrorHook`
         */
        statusCode: number
        /**
         * Axios error object
         */
        error: AxiosError
        /**
         * Request context
         */
        callContext: ApiCallContext
    } = z

    /**
     * Enable/disable debug mode
     */
    switchDebugMode: boolean = z

    /**
     * Download state to device
     */
    exportState: null = z

    /**
     * TODO
     */
    emptyAction: null = z

    /**
     * refresh screens, views and widgets meta
     */
    refreshMeta: null = z

    /**
     * Switch to another user role
     */
    switchRole: {
        role: string
    } = z

    /**
     * Add pending request for tracking and blocking race conditions
     */
    addPendingRequest: {
        request: PendingRequest
    } = z

    /**
     * Remove pending request
     */
    removePendingRequest: {
        requestId: string
    } = z
}

// action-types
/**
 * @category Actions
 */
export const types = util.createActionTypes(new ActionPayloadTypes())
/**
 * Checks if need to perform autosave on specified action type call
 *
 * @param action
 * @category Actions
 */
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
/**
 * @category Actions
 */
export const $do = util.createActionCreators(new ActionPayloadTypes())
export type ActionsMap = util.uActionsMap<ActionPayloadTypes>
/**
 * Any of the core actions
 *
 * @category Actions
 */
export type AnyAction = util.AnyOfMap<ActionsMap> | { type: ' UNKNOWN ACTION '; payload?: any }

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
