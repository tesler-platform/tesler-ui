import {AnyAction, Dispatch, MiddlewareAPI} from 'redux'
import {$do, needSaveAction, types} from '../actions/actions'
import {OperationTypeCrud} from '../interfaces/operation'
import {WidgetMeta} from '../interfaces/widget'
import {Store as CoreStore} from '../interfaces/store'

const saveFormMiddleware = ({ getState, dispatch }: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>) =>
    (next: Dispatch) =>
        (action: AnyAction) => {
            const state = getState()

            // TODO: Should offer to save pending changes or drop them

            /**
             * Don't save by `bcChangePage` if a popup is open
             */
            const isPopupOpen = state.view.popupData?.bcName === action.payload?.bcName
            const isChangePageInPopup = isPopupOpen && action.type === types.bcChangePage
            if (isChangePageInPopup) {return next(action)}

            const isSendOperation = action.type === types.sendOperation
            const isSelectTableCellInit = action.type === types.selectTableCellInit

            /**
             * Checking if the action is `needSaveAction` but not `sendOperation` or `selectTableCellInit` action
             * because those actions will be checked lower
             */
            const isNeedSaveActionNotSendOperation = !isSendOperation && !isSelectTableCellInit && needSaveAction(action.type)

            /**
             * Checking if `sendOperation` has type `create` and widget has pending changes
             */
            const isSendOperationCreate = isSendOperation
                && action.payload.operationType === OperationTypeCrud.create

            /**
             * Checking if the action is `sendOperation` which called for another BC
             * Also BCs having pending `_associate` should be ignored
             */
            const actionBcName = isSendOperation && action.payload.bcName
            const hasAnotherUnsavedBc = Object.keys(state.view.pendingDataChanges)
            .filter(key => key !== actionBcName)
            .filter(key => checkUnsavedChangesOfBc(state, key)).length > 0
            const isSendOperationForAnotherBc = isSendOperation && hasAnotherUnsavedBc

            /**
             * Checking if the action is `selectTableCellInit` called for another row or another widget
             */
            const selectedCell = state.view.selectedCell
            const isSelectTableCellInitOnAnotherRowOrWidget = selectedCell && isSelectTableCellInit &&
                (selectedCell.widgetName !== action.payload.widgetName || selectedCell.rowId !== action.payload.rowId)

            /**
             * Checking if the action is `changeDataItem` called for another row.
             * Except cases of associations
             */
            const isChangeDataItem = action.type === types.changeDataItem
            const notAssociationAction = isChangeDataItem && action.payload.dataItem._associate === undefined
            const isChangeDataItemForAnotherCursor = notAssociationAction &&
                action.payload.cursor !== state.screen.bo.bc[action.payload.bcName].cursor

            /**
             * Default save operation as custom action
             *
             * If widget have only custom actions, `defaultSave` option mean witch action
             * must be executed as save record.
             * Current changeLocation action as onSuccessAction
             */
            const defaultSaveWidget = state.view.widgets?.find(item => item?.options?.actionGroups?.defaultSave)
            const defaultCursor = state.screen.bo.bc?.[defaultSaveWidget?.bcName]?.cursor
            const pendingData = state.view?.pendingDataChanges?.[defaultSaveWidget?.bcName]?.[defaultCursor]
            if (defaultSaveWidget && action.type === types.changeLocation && pendingData) {
                return next($do.sendOperation({
                    bcName: defaultSaveWidget.bcName,
                    operationType: defaultSaveWidget.options.actionGroups.defaultSave,
                    widgetName: defaultSaveWidget.name,
                    onSuccessAction: action
                }))
            }

            /**
             * final condition
             */
            const isNeedSaveCondition = isNeedSaveActionNotSendOperation
                || isSendOperationCreate
                || isSendOperationForAnotherBc
                || isSelectTableCellInitOnAnotherRowOrWidget
                || isChangeDataItemForAnotherCursor
            /**
             * Default save operation CRUD
             */
            if (isNeedSaveCondition) {
                const pendingDataChanges = state.view.pendingDataChanges
                const bcList = Object.keys(pendingDataChanges)
                // find BC with changes
                const baseBcNameIndex = bcList
                .findIndex(bcName => bcHasPendingAutosaveChanges(state, bcName, state.screen.bo.bc[bcName]?.cursor))
                const baseBcName = bcList[baseBcNameIndex]
                if (baseBcNameIndex > -1) {bcList.splice(baseBcNameIndex, 1)}
                const baseWidget = baseBcName && state.view.widgets.find((v: WidgetMeta) => v.bcName === baseBcName)
                if (baseBcName) {
                    // save all BCs except `baseBcName`
                    bcList.forEach(bcName => {
                        const widget = state.view.widgets.find((v: WidgetMeta) => v.bcName === bcName)
                        const cursor = state.screen.bo.bc[bcName]?.cursor
                        if (bcHasPendingAutosaveChanges(state, bcName, cursor)) {
                            dispatch($do.sendOperation({
                                bcName: bcName,
                                operationType: OperationTypeCrud.save,
                                widgetName: widget.name,
                            }))
                        }
                    })
                    if (action.payload.operationType !== OperationTypeCrud.save) {
                        // save `baseBcName`'s BC
                        return next($do.sendOperation({
                            bcName: baseBcName,
                            operationType: OperationTypeCrud.save,
                            widgetName: baseWidget.name,
                            onSuccessAction: action
                        }))
                    }
                }
            }

            return next(action)
        }

/**
 *
 */
export function createAutoSaveMiddleware() {
    return saveFormMiddleware
}

/**
 *
 * @param store
 * @param bcName
 * @param cursor
 */
function bcHasPendingAutosaveChanges(store: CoreStore, bcName: string, cursor: string) {
    const pendingChanges = store.view.pendingDataChanges
    const cursorChanges = pendingChanges[bcName]?.[cursor]
    const result = cursorChanges && !Object.keys(cursorChanges).includes('_associate') && Object.values(cursorChanges).length
    return result
}

function checkUnsavedChangesOfBc(store: CoreStore, bcName: string) {
    let checkResult = false
    const checkCursors = Object.keys(store.view.pendingDataChanges[bcName])
    let i = 0
    for(; i < checkCursors.length; i++) {
        if (bcHasPendingAutosaveChanges(store, bcName, checkCursors[i])) {
            checkResult = true
            break
        }
    }
    return checkResult
}
