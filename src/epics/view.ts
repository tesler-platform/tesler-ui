import {types, Epic, $do, AnyAction} from '../actions/actions'
import {Observable} from 'rxjs/Observable'
import * as api from '../api/api'
import {buildBcUrl} from '../utils/strings'
import {isCrud, OperationTypeCrud, OperationError, OperationErrorEntity, OperationModalInvokeConfirm, OperationPostInvokeConfirmType} from '../interfaces/operation'
import {findBcDescendants} from '../utils/bo'
import {buildLocation} from '../Provider'
import {changeLocation} from '../reducers/router'
import {AxiosError} from 'axios'
import {parseBcCursors} from '../utils/history'
import {ObjectMap} from '../interfaces/objectMap'
import {WidgetTypes} from '../interfaces/widget'
import {MultivalueSingleValue, PendingDataItem} from '../interfaces/data'

const sendOperation: Epic = (action$, store) => action$.ofType(types.sendOperation)
.filter(action => !isCrud(action.payload.operationType))
.mergeMap((action) => {
    const state = store.getState()
    const screenName = state.screen.screenName
    const {bcName, operationType, widgetName} = action.payload
    // TODO: Remove conformOperation n 2.0.0
    const confirm = action.payload.confirmOperation?.type || action.payload.confirm
    const bcUrl = buildBcUrl(bcName, true)
    const bc = state.screen.bo.bc[bcName]
    const rowMeta = bcUrl && state.view.rowMeta[bcName]?.[bcUrl]
    const fields = rowMeta?.fields
    const cursor = bc.cursor
    const record = state.data[bcName]?.find(item => item.id === bc.cursor)
    const pendingRecordChange = state.view.pendingDataChanges[bcName]?.[bc.cursor]
    for (const key in pendingRecordChange) {
        if (fields.find(item => item.key === key && item.disabled)) {
            delete pendingRecordChange[key]
        }
    }
    const data = record && { ...pendingRecordChange, vstamp: record.vstamp }
    const params = confirm
        ? { _action: operationType, _confirm: confirm }
        : { _action: operationType }
    const context = { widgetName: action.payload.widgetName }
    return api.customAction(screenName, bcUrl, data, context, params)
    .mergeMap(response => {
        const postInvoke = response.postActions[0]
        // TODO: Remove in 2.0.0 in favor of postInvokeConfirm (is this todo needed?)
        const preInvoke = response.preInvoke
        const postInvokeConfirm = Object.values(OperationPostInvokeConfirmType).includes(postInvoke?.type as OperationPostInvokeConfirmType)
        return Observable.concat(
            Observable.of($do.sendOperationSuccess({ bcName, cursor })),
            Observable.of($do.bcForceUpdate({ bcName })),
            postInvoke
                ? Observable.of($do.processPostInvoke({ bcName, postInvoke, widgetName: context.widgetName }))
                : Observable.empty<never>(),
            postInvokeConfirm
                ? Observable.of($do.processPostInvokeConfirm({
                    bcName,
                    operationType,
                    widgetName,
                    postInvokeConfirm: postInvoke as OperationModalInvokeConfirm
                }))
                : Observable.empty<never>(),
            preInvoke
                ? Observable.of($do.processPreInvoke({
                    bcName,
                    operationType,
                    widgetName,
                    preInvoke,
                }))
                : Observable.empty<never>(),
        )
    })
    .catch((e: AxiosError) => {
        console.error(e)
        let viewError: string = null
        let entityError: OperationErrorEntity = null
        const operationError = e.response?.data as OperationError
        if (e.response?.data === Object(e.response?.data)) {
            entityError = operationError?.error?.entity
            viewError = operationError?.error?.popup?.[0]
        }
        return Observable.of($do.sendOperationFail({ bcName, bcUrl, viewError, entityError }))
    })
})

const sendOperationAssociate: Epic = (action$, store) => action$.ofType(types.sendOperation)
.filter(action => action.payload.operationType === OperationTypeCrud.associate)
.map(action => {
    const {bcName, operationType, widgetName, onSuccessAction, confirm, confirmOperation, ...customParam} = action.payload
    /**
     * If action have some customParam, then do another implementation
     */
    if (Object.keys(customParam).length) {
        return $do.emptyAction(null)
    }
    return $do.showViewPopup({
        bcName: `${bcName}Assoc`,
        calleeBCName: bcName,
        active: true
    })
})

/*
*   Эпик, который отправляет запрос на роумету при изменении значения поля с признаком forceActive.
*/
const getRowMetaByForceActive: Epic = (action$, store) => action$.ofType(types.changeDataItem)
.mergeMap((action) => {
    const state = store.getState()
    const initUrl = state.view.url
    const {bcName, cursor, disableRetry} = action.payload

    const isBcHierarchy = state.view.widgets.some((widget) => {
        return widget.bcName === bcName && widget.type === WidgetTypes.AssocListPopup
            && (widget.options?.hierarchySameBc || widget.options?.hierarchyFull)
    })
    if (isBcHierarchy) {
        return Observable.empty<never>()
    }

    const bcUrl = buildBcUrl(bcName, true)
    const pendingChanges = state.view.pendingDataChanges[bcName][cursor]
    const handledForceActive = state.view.handledForceActive[bcName]?.[cursor] || {}
    const currentRecordData = state.data[bcName].find((record) => record.id === cursor)
    const fieldsRowMeta = state.view.rowMeta[bcName][bcUrl]?.fields
    let changedFiledKey: string = null

    // среди forceActive-полей в дельте ищем то которое изменилось по отношению к обработанным forceActive
    // или не содержится в нем, устанавливаем флаг необходимости отправки запроса если такое поле найдено
    const someForceActiveChanged = fieldsRowMeta
        .filter((field) => field.forceActive && pendingChanges[field.key] !== undefined)
        .some((field) => {
            const result = pendingChanges[field.key] !== handledForceActive[field.key]
            if (result) {
                changedFiledKey = field.key
            }
            return result
        })

    if (someForceActiveChanged && !disableRetry) {
        return api.getRmByForceActive(
            state.screen.screenName,
            bcUrl,
            {...pendingChanges, vstamp: currentRecordData.vstamp}
        )
        .mergeMap((data) => {
            return (store.getState().view.url === initUrl)
                ? Observable.of($do.forceActiveRmUpdate({
                    rowMeta: data,
                    currentRecordData,
                    bcName,
                    bcUrl,
                    cursor
                }))
                : Observable.empty<never>()
        })
        .catch((e: AxiosError) => {
            console.error(e)
            let viewError: string = null
            let entityError: OperationErrorEntity = null
            const operationError = e.response?.data as OperationError
            if (e.response?.data === Object(e.response?.data)) {
                entityError = operationError?.error?.entity
                viewError = operationError?.error?.popup?.[0]
            }
            return (store.getState().view.url === initUrl)
                ? Observable.concat(
                    Observable.of($do.changeDataItem({
                        bcName,
                        cursor,
                        dataItem: {[changedFiledKey]: currentRecordData[changedFiledKey]},
                        disableRetry: true
                    })),
                    Observable.of($do.forceActiveChangeFail({bcName, bcUrl, viewError, entityError})))
                : Observable.empty<never>()
        })
    }
    return Observable.empty<never>()
})

/*
*   Эпик, который очищает дельту по дочерним бк при смене курсора
* TODO При реализации автосохранения потеряет смысл, можно будет удалить
*/
const clearPendingDataChangesAfterCursorChange: Epic = (action$, store) => action$.ofType(types.bcChangeCursors)
.mergeMap((action) => {
    const state = store.getState()
    const childBcList = Object.keys(action.payload.cursorsMap).map(
        (bcName) => findBcDescendants(bcName, state.screen.bo.bc)
    ).reduce((a, b) => a.concat(b), [])

    /*
    *  Если при загрузке view курсор проставился не во всех бк
    * то дописать недостающие курсоры
    */
    const nextCursors = parseBcCursors(state.router.bcPath) || {}
    const cursorsDiffMap: ObjectMap<string> = {}
    Object.entries(nextCursors).forEach(entry => {
        const [ bcName, cursor ] = entry
        const bc = state.screen.bo.bc[bcName]
        if (!bc || bc?.cursor !== cursor) {
            cursorsDiffMap[bcName] = cursor
        }
    })
    if (Object.keys(cursorsDiffMap).length) {
        return Observable.of($do.bcChangeCursors({ cursorsMap: cursorsDiffMap }))
    }

    return (action.payload.keepDelta)
        ? Observable.empty<never>()
        : Observable.of<AnyAction>($do.bcCancelPendingChanges({bcNames: childBcList}))
})

const selectTableCellInit: Epic = (action$, store) => action$.ofType(types.selectTableCellInit)
.mergeMap((action) => {
    const resultObservables: Array<Observable<AnyAction>> = []
    const state = store.getState()

    const {rowId: nextRowId, fieldKey} = action.payload

    const nextWidget = state.view.widgets.find(widget => widget.name === action.payload.widgetName)
    const nextBcName = nextWidget.bcName
    const nextBcCursor = state.screen.bo.bc[nextBcName]?.cursor

    const selectedCell = state.view.selectedCell
    if (nextRowId !== nextBcCursor) {
        resultObservables.push(Observable.of(
            $do.bcSelectRecord({ bcName: nextBcName, cursor: nextRowId })
        ))
    }

    if (!selectedCell || fieldKey !== selectedCell.fieldKey || nextRowId !== selectedCell.rowId
        || nextWidget.name !== selectedCell.widgetName
    ) {
        resultObservables.push(Observable.of(
            $do.selectTableCell({ widgetName: nextWidget.name, rowId: nextRowId, fieldKey })
        ))
    }

    return Observable.concat(...resultObservables)
})

const showAllTableRecordsInit: Epic = (action$, store) => action$.ofType(types.showAllTableRecordsInit)
.mergeMap((action) => {
    const resultObservables: Array<Observable<AnyAction>> = []

    const {bcName, cursor} = action.payload
    const route = store.getState().router
    resultObservables.push(Observable.of(
        $do.bcChangeCursors({ cursorsMap: { [bcName]: null }})
    ))
    const bcPath = route.bcPath.slice(0, route.bcPath.indexOf(`${bcName}/${cursor}`))
    const url = buildLocation({ ...route, bcPath })

    resultObservables.push(Observable.of(
        $do.bcForceUpdate({ bcName })
    ))
    changeLocation(url)

    return Observable.concat(...resultObservables)
})

const showAssocPopup: Epic = (action$, store) => action$.ofType(types.showViewPopup)
.filter(action => !!(action.payload.calleeBCName && action.payload.associateFieldKey))
.mergeMap((action) => {
    const {bcName, calleeBCName} = action.payload

    const state = store.getState()

    const assocWidget = state.view.widgets.find((widget) => widget.bcName === bcName && widget.type === WidgetTypes.AssocListPopup)
    if (!assocWidget?.options?.hierarchyFull) {
        return Observable.empty<never>()
    }

    const calleeCursor = state.screen.bo.bc[calleeBCName]?.cursor
    const calleePendingChanges = calleeCursor && state.view.pendingDataChanges[calleeBCName]?.[calleeCursor]
    const assocFieldKey = action.payload.associateFieldKey
    const assocFieldChanges = (calleePendingChanges?.[assocFieldKey] as MultivalueSingleValue[])
    const popupInitPendingChanges: Record<string, PendingDataItem> = {}

    if (assocFieldChanges) {
        assocFieldChanges.forEach((record) => {
            popupInitPendingChanges[record.id] = {
                id: record.id,
                _associate: true,
                _value: record.value
            }
        })

        const calleeData = state.data[calleeBCName]?.find((dataRecord) => dataRecord.id === calleeCursor)
        const assocIds = (calleeData?.[assocFieldKey] as MultivalueSingleValue[]).map((recordId) => recordId.id)
        const assocPendingIds = assocFieldChanges.map((recordId) => recordId.id)
        if (assocIds) {
            assocIds.forEach((recordId) => {
                if (!assocPendingIds.includes(recordId)) {
                    popupInitPendingChanges[recordId] = {
                        id: recordId,
                        _associate: false
                    }
                }
            })
        }
    } else {
        const assocDataValues = state.data[bcName].filter(dataItem => dataItem._associate)
        assocDataValues.forEach((record) => {
            popupInitPendingChanges[record.id] = {
                ...record,
                id: record.id,
                _associate: true,
                _value: record[action.payload.assocValueKey]
            }
        })
    }
    return Observable.of($do.changeDataItems({
        bcName,
        cursors: Object.keys(popupInitPendingChanges),
        dataItems: Object.values(popupInitPendingChanges)
    }))
})

export const viewEpics = {
    sendOperation,
    getRowMetaByForceActive,
    sendOperationAssociate,
    clearPendingDataChangesAfterCursorChange,
    selectTableCellInit,
    showAllTableRecordsInit,
    showAssocPopup
}
