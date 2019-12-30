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
import {OperationPostInvokeAny, OperationTypeCrud, AssociatedItem, OperationErrorEntity} from '../interfaces/operation'
import {BcFilter, BcSorter} from '../interfaces/filters'

const z = null as any

/*
    ActionName: PayloadType = z

    ActionName - Имя Action оно же имя ActionCreator-а и значение поле type в экшене
    PayloadType - тип payload поля в экшене и он же тип входного параметра ActionCreator-а
    = z в конце указывать обязательно, иначе поля класса не будет в runtume
    и экшен не будет создан runtume(а ts будет считать что он есть)
*/
export class ActionPayloadTypes {
    changeLocation: {
        rawLocation?: string,
        location?: Route,
        action: HistoryAction
    } = z
    login: {
        login: string,
        password: string,
        role?: string
    } = z
    loginDone: LoginResponse = z
    loginFail: { errorMsg: string } = z
    logout: null = z
    logoutDone: null = z
    selectScreen: {
        screen: SessionScreen
    } = z
    selectScreenFail: {
        screenName: string
    } = z
    selectView: ViewMetaResponse = z
    selectViewFail: {
        viewName: string
    } = z
    bcFetchDataRequest: {
        bcName: string,
        depth?: number,
        widgetName: string,
        ignorePageLimit?: boolean,
        keepDelta?: boolean
    } = z
    inlinePickListFetchDataRequest: {
        bcName: string,
        searchSpec: string,
        searchString: string
    } = z
    bcFetchDataStart: {
        bcName: string,
        widgetName: string
    } = z
    bcFetchDataSuccess: {
        bcName: string,
        data: DataItem[],
        depth?: number,
        bcUrl: string,
        hasNext?: boolean
    } = z
    bcFetchDataFail: {
        bcName: string,
        bcUrl: string,
        depth?: number,
    } = z
    bcLoadMore: {
        bcName: string
    } = z
    bcFetchRowMeta: {
        bcName: string,
        widgetName: string
    } = z
    bcFetchRowMetaSuccess: {
        bcName: string,
        bcUrl: string,
        rowMeta: RowMeta,
        cursor?: string
    } = z
    bcFetchRowMetaFail: {
        bcName: string
    } = z
    bcNewData: {
        bcName: string
    } = z
    bcNewDataSuccess: {
        bcName: string,
        dataItem: DataItem,
        bcUrl: string
    } = z
    bcNewDataFail: {
        bcName: string
    } = z
    bcDeleteDataFail: {
        bcName: string
    } = z
    sendOperation: {
        bcName: string,
        operationType: OperationTypeCrud | string,
        widgetName: string,
        onSuccessAction?: AnyAction,
    } = z
    sendOperationFail: {
        bcName: string,
        bcUrl: string,
        viewError: string,
        entityError: OperationErrorEntity
    } = z
    sendOperationSuccess: {
        bcName: string,
        cursor: string
    } = z
    processPostInvoke: {
        bcName: string,
        postInvoke: OperationPostInvokeAny,
        cursor?: string
    } = z
    userDrillDown: {
        widgetName: string,
        bcName: string,
        cursor: string,
        fieldKey: string
    } = z
    userDrillDownSuccess: {
        bcUrl: string,
        bcName: string,
        cursor: string
    } = z
    drillDown: {
        url: string,
        drillDownType?: DrillDownType,
        urlName?: string,
        route: Route
    } = z
    bcChangeCursors: {
        cursorsMap: ObjectMap<string>,
        keepDelta?: boolean
    } = z
    bcChangeDepthCursor: {
        bcName: string,
        depth: number,
        cursor: string
    } = z
    changeDataItem: {
        bcName: string,
        cursor: string,
        dataItem: PendingDataItem
    } = z
    changeDataItems: {
        bcName: string,
        cursors: string[],
        dataItems: PendingDataItem[]
    } = z
    forceActiveRmUpdate: {
        // данные текущей записи, для которой вызывалось обновление rowMeta
        currentRecordData: DataItem,
        rowMeta: RowMeta,
        bcName: string,
        bcUrl: string,
        cursor: string
    } = z
    showViewPopup: {
        bcName: string,
        calleeBCName?: string,
        associateFieldKey?: string,
        assocValueKey?: string,
        active?: boolean
    } = z
    closeViewPopup: {
        bcName: string
    } = z
    viewPutPickMap: {
        map: PickMap,
        bcName: string,
    } = z
    viewClearPickMap: null = z
    saveAssociations: {
        bcNames: string[],
        // Для использования вне попапа (multivalue не открывая)
        calleeBcName?: string,
        associateFieldKey?: string
    } = z
    changeAssociations: {
        bcName: string,
        records?: DataItem[]
    } = z
    removeMultivalueTag: {
        bcName: string,
        popupBcName: string,
        cursor: string,
        associateFieldKey: string,
        dataItem: MultivalueSingleValue[],
        removedItem: MultivalueSingleValue
    } = z
    bcSaveDataSuccess: {
        bcName: string,
        cursor: string,
        dataItem: DataItem
    } = z
    bcSaveDataFail: {
        bcName: string,
        bcUrl: string,
        entityError?: OperationErrorEntity,
        viewError?: string
    } = z
    bcForceUpdate: {
        bcName: string
    } = z
    uploadFile: null = z
    uploadFileDone: null = z
    uploadFileFailed: null = z
    bcCancelPendingChanges: {
        bcNames: string[]
    } = z
    bcSelectRecord: {
        bcName: string,
        cursor: string,
        ignoreChildrenPageLimit?: boolean,
        keepDelta?: boolean
    } = z
    bcSelectDepthRecord: {
        bcName: string,
        depth: number,
        cursor: string,
    } = z
    changeAssociation: {
        bcName: string,
        widgetName: string,
        dataItem: AssociatedItem,
        assocValueKey: string
    } = z
    changeAssociationSameBc: {
        bcName: string,
        depth: number,
        widgetName: string,
        dataItem: AssociatedItem,
        assocValueKey: string
    } = z
    changeAssociationFull: {
        bcName: string,
        depth: number,
        widgetName: string,
        dataItem: AssociatedItem,
        assocValueKey: string
    } = z
    changeChildrenAssociations: {
        bcName: string,
        assocValueKey: string,
        selected: boolean
    } = z
    changeChildrenAssociationsSameBc: {
        bcName: string,
        depth: number,
        assocValueKey: string,
        selected: boolean
    } = z
    changeDescendantsAssociationsFull: {
        bcName: string,
        parentId: string,
        depth: number,
        assocValueKey: string,
        selected: boolean
    } = z
    dropAllAssociations: {
        bcNames: string[]
    } = z
    dropAllAssociationsSameBc: {
        bcName: string,
        depthFrom: number
    } = z
    dropAllAssociationsFull: {
        bcName: string,
        depth: number,
        dropDescendants?: boolean
    } = z
    handleRouter: {
        path: string,
        params: object
    } = z
    selectTableCellInit: {
        widgetName: string,
        rowId: string,
        fieldKey: string,
    } = z
    selectTableCell: {
        widgetName: string,
        rowId: string,
        fieldKey: string,
    } = z
    showAllTableRecordsInit: {
        bcName: string,
        cursor: string,
        route: Route
    } = z
    showNotification: {
        type: AppNotificationType,
        message: string
    } = z
    closeNotification: {
        id: number
    } = z
    bcAddFilter: {
        bcName: string,
        filter: BcFilter
    } = z
    bcRemoveFilter: {
        bcName: string,
        filter: BcFilter
    } = z
    bcAddSorter: {
        bcName: string,
        sorter: BcSorter
    } = z
    bcRemoveSorter: {
        bcName: string,
        sorter: BcSorter
    } = z
    bcChangePage: {
        bcName: string,
        page: number
    } = z
    showViewError: {
        error: ApplicationError
    } = z
    closeViewError: null = z
    clearValidationFails: null = z
    downloadFile: {
        fileId: string
    } = z
    downloadFileByUrl: {
        url: string
    } = z
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
        types.bcChangePage
    ]

    return actions.indexOf(action) > -1
}
// action-creators
export const $do = util.createActionCreators(new ActionPayloadTypes())
export type ActionsMap = util.uActionsMap<ActionPayloadTypes>
// тип для любого action
export type AnyAction = util.AnyOfMap<ActionsMap> | {type: ' UNKNOWN ACTION '}

export interface ActionsObservable<T extends AnyAction> extends rActionsObservable<T> {
    ofType<K extends keyof ActionPayloadTypes>(...key: K[]): ActionsObservable<ActionsMap[K]>
}
// тип любого Epic
export type Epic = (action$: ActionsObservable<AnyAction>, store: Store<CoreStore>) => Observable<AnyAction>
