import { types, Epic, $do, AnyAction } from '../actions/actions'
import { Observable } from 'rxjs/Observable'
import {
    OperationModalInvokeConfirm,
    OperationPostInvokeConfirmType,
    OperationPostInvokeAny,
    OperationPreInvoke
} from '../interfaces/operation'
import { buildLocation } from '../Provider'
import { changeLocation } from '../reducers/router'
import { parseBcCursors } from '../utils/history'
import { fileUploadConfirm } from './view/fileUploadConfirm'
import { showFileUploadPopup } from './view/showFileUploadPopup'
import { sendOperation } from './view/sendOperation'
import { showAssocPopup } from './view/showAssocPopup'
import { sendOperationAssociate } from './view/sendOperationAssociate'
import { changePopupValueAndClose } from './view/changePopupValueAndClose'
import { getRowMetaByForceActive } from './view/getRowMetaByForceActive'

/**
 * Clears descendant business components pending changes on cursor change
 *
 * TODO: Review required as it might be no longer valid due to autosave middleware implementation
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const clearPendingDataChangesAfterCursorChange: Epic = (action$, store) =>
    action$.ofType(types.bcChangeCursors).mergeMap(action => {
        const state = store.getState()

        /*
         *  Если при загрузке view курсор проставился не во всех бк
         * то дописать недостающие курсоры
         */
        const nextCursors = parseBcCursors(state.router.bcPath) || {}
        const cursorsDiffMap: Record<string, string> = {}
        Object.entries(nextCursors).forEach(entry => {
            const [bcName, cursor] = entry
            const bc = state.screen.bo.bc[bcName]
            if (!bc || bc?.cursor !== cursor) {
                cursorsDiffMap[bcName] = cursor
            }
        })
        if (Object.keys(cursorsDiffMap).length) {
            return Observable.of($do.bcChangeCursors({ cursorsMap: cursorsDiffMap }))
        }

        return Observable.empty<never>()
    })

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const selectTableCellInit: Epic = (action$, store) =>
    action$.ofType(types.selectTableCellInit).mergeMap(action => {
        const resultObservables: Array<Observable<AnyAction>> = []
        const state = store.getState()

        const { rowId: nextRowId, fieldKey } = action.payload

        const nextWidget = state.view.widgets.find(widget => widget.name === action.payload.widgetName)
        const nextBcName = nextWidget.bcName
        const nextBcCursor = state.screen.bo.bc[nextBcName]?.cursor

        const selectedCell = state.view.selectedCell
        if (nextRowId !== nextBcCursor) {
            resultObservables.push(Observable.of($do.bcSelectRecord({ bcName: nextBcName, cursor: nextRowId })))
        }

        if (
            !selectedCell ||
            fieldKey !== selectedCell.fieldKey ||
            nextRowId !== selectedCell.rowId ||
            nextWidget.name !== selectedCell.widgetName
        ) {
            resultObservables.push(Observable.of($do.selectTableCell({ widgetName: nextWidget.name, rowId: nextRowId, fieldKey })))
        }

        return Observable.concat(...resultObservables)
    })

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const showAllTableRecordsInit: Epic = (action$, store) =>
    action$.ofType(types.showAllTableRecordsInit).mergeMap(action => {
        const resultObservables: Array<Observable<AnyAction>> = []

        const { bcName, cursor } = action.payload
        const route = store.getState().router
        resultObservables.push(Observable.of($do.bcChangeCursors({ cursorsMap: { [bcName]: null } })))
        const bcPath = route.bcPath.slice(0, route.bcPath.indexOf(`${bcName}/${cursor}`))
        const url = buildLocation({ ...route, bcPath })

        resultObservables.push(Observable.of($do.bcForceUpdate({ bcName })))
        changeLocation(url)

        return Observable.concat(...resultObservables)
    })

/**
 * Returns an array of observables for handling post- and pre-invokes from any epics handling operations
 *
 * @param widgetName Name of the widget that initiated the operation
 * @param postInvoke Response post-invoke
 * @param preInvoke Response pre-invoke
 * @param operationType Which operation was performed
 * @param bcName
 * @category Utils
 */
export function postOperationRoutine(
    widgetName: string,
    postInvoke: OperationPostInvokeAny,
    preInvoke: OperationPreInvoke,
    operationType: string,
    bcName: string // TODO: Remove in 2.0.0
) {
    const postInvokeConfirm = Object.values(OperationPostInvokeConfirmType).includes(postInvoke?.type as OperationPostInvokeConfirmType)
    const result: AnyAction[] = []
    if (postInvoke) {
        result.push($do.processPostInvoke({ bcName, postInvoke, widgetName }))
    }
    if (postInvokeConfirm) {
        result.push(
            $do.processPostInvokeConfirm({
                bcName,
                operationType,
                widgetName,
                postInvokeConfirm: postInvoke as OperationModalInvokeConfirm
            })
        )
    }
    if (preInvoke) {
        result.push(
            $do.processPreInvoke({
                bcName,
                operationType,
                widgetName,
                preInvoke
            })
        )
    }
    return result.map(item => Observable.of(item))
}

export const viewEpics = {
    changePopupValueAndClose,
    sendOperation,
    getRowMetaByForceActive,
    sendOperationAssociate,
    clearPendingDataChangesAfterCursorChange,
    selectTableCellInit,
    showAllTableRecordsInit,
    showAssocPopup,
    showFileUploadPopup,
    fileUploadConfirm
}
