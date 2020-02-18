import {combineEpics} from 'redux-observable'
import {types, Epic, $do, AnyAction} from '../actions/actions'
import {Observable} from 'rxjs/Observable'
import * as api from '../api/api'
import {buildBcUrl} from '../utils/strings'
import {isCrud, OperationTypeCrud, OperationError, OperationErrorEntity} from '../interfaces/operation'
import {findBcDescendants} from '../utils/bo'
import {buildLocation} from '../Provider'
import {changeLocation} from '../reducers/router'
import {AxiosError} from 'axios'
import {parseBcCursors} from '../utils/history'
import {ObjectMap} from '../interfaces/objectMap'
import {WidgetTypes} from '../interfaces/widget'

const sendOperation: Epic = (action$, store) => action$.ofType(types.sendOperation)
.filter(action => !isCrud(action.payload.operationType))
.mergeMap((action) => {
    const state = store.getState()
    const screenName = state.screen.screenName
    const bcName = action.payload.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const bc = state.screen.bo.bc[bcName]
    const cursor = bc.cursor
    const record = state.data[bcName] && state.data[bcName].find(item => item.id === bc.cursor)
    const pendingRecordChange = state.view.pendingDataChanges[bcName] && state.view.pendingDataChanges[bcName][bc.cursor]
    const data = record && { ...pendingRecordChange, vstamp: record && record.vstamp }
    const params = { _action: action.payload.operationType }
    const context = { widgetName: action.payload.widgetName }
    return api.customAction(screenName, bcUrl, data, context, params)
    .mergeMap(response => {
        const postInvoke = response.postActions[0]
        return Observable.concat(
            Observable.of($do.sendOperationSuccess({ bcName, cursor })),
            Observable.of($do.bcForceUpdate({ bcName })),
            postInvoke
                ? Observable.of($do.processPostInvoke({ bcName, postInvoke, widgetName: context.widgetName }))
                : Observable.empty<never>(),
        )
    })
    .catch((e: AxiosError) => {
        console.error(e)
        let viewError: string = null
        let entityError: OperationErrorEntity = null
        const operationError = e.response.data as OperationError
        if (e.response.data === Object(e.response.data)) {
            entityError = operationError.error.entity
            viewError = operationError.error.popup && operationError.error.popup[0]
        }
        return Observable.of($do.sendOperationFail({ bcName, bcUrl, viewError, entityError }))
    })
})

const sendOperationAssociate: Epic = (action$, store) => action$.ofType(types.sendOperation)
.filter(action => action.payload.operationType === OperationTypeCrud.associate)
.map(action => {
    return $do.showViewPopup({
        bcName: `${action.payload.bcName}Assoc`,
        calleeBCName: action.payload.bcName,
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
        return widget.bcName === bcName && widget.type === WidgetTypes.AssocListPopup && widget.options
            && (widget.options.hierarchySameBc || widget.options.hierarchyFull)
    })
    if (isBcHierarchy) {
        return Observable.empty<never>()
    }

    const bcUrl = buildBcUrl(bcName, true)
    const pendingChanges = state.view.pendingDataChanges[bcName][cursor]
    const handledForceActive = state.view.handledForceActive[bcName] && state.view.handledForceActive[bcName][cursor] || {}
    const currentRecordData = state.data[bcName].find((record) => record.id === cursor)
    const fieldsRowMeta = state.view.rowMeta[bcName][bcUrl].fields
    let changedFiledKey: string = null

    // среди forceActive-полей в дельте ищем то которое изменилось по отношению к обработанным forceActive
    // или не содержится в нем, устанавливаем флаг необходимости отправки запроса если такое поле найдено
    const someForceActiveChanged = fieldsRowMeta
        .filter((field) => field.forceActive && (pendingChanges[field.key] !== undefined))
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
        .catch((error) => {
            return (store.getState().view.url === initUrl)
                ? Observable.of($do.changeDataItem({
                    bcName,
                    cursor,
                    dataItem: {[changedFiledKey]: currentRecordData[changedFiledKey]},
                    disableRetry: true
                }))
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
        if (!bc || bc && bc.cursor !== cursor) {
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
    const nextBcCursor = state.screen.bo.bc[nextBcName] && state.screen.bo.bc[nextBcName].cursor

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

    const {bcName, route, cursor} = action.payload

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

export const viewEpics = combineEpics(
    sendOperation,
    getRowMetaByForceActive,
    sendOperationAssociate,
    clearPendingDataChangesAfterCursorChange,
    selectTableCellInit,
    showAllTableRecordsInit
)
