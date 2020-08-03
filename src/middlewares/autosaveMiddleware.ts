import {AnyAction, Dispatch, MiddlewareAPI} from 'redux'
import {$do, types} from '../actions/actions'
import {coreOperations, OperationTypeCrud} from '../interfaces/operation'
import {Store as CoreStore} from '../interfaces/store'
import {autosaveRoutine, checkUnsavedChangesOfBc} from '../utils/autosave'

const saveFormMiddleware = ({ getState, dispatch }: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>) =>
    (next: Dispatch) =>
        (action: AnyAction) => {
            const state = getState()

            // TODO: Should offer to save pending changes or drop them

            const isSendOperation = action.type === types.sendOperation
            const isCoreSendOperation = isSendOperation && coreOperations.includes(action.payload.operationType)
            const isSelectTableCellInit = action.type === types.selectTableCellInit

            /**
             * Saving actions should be ignored
             */
            const isSaveAction = isSendOperation && action.payload.operationType === OperationTypeCrud.save
            const isNotSaveAction = !isSaveAction

            /**
             * Checking if the action is `sendOperation` of core type which called for another BC
             * Also BCs having pending `_associate` should be ignored
             */
            const actionBcName = isSendOperation && action.payload.bcName
            const hasAnotherUnsavedBc = Object.keys(state.view.pendingDataChanges)
            .filter(key => key !== actionBcName)
            .filter(key => checkUnsavedChangesOfBc(state, key)).length > 0
            const isSendOperationForAnotherBc = isCoreSendOperation && hasAnotherUnsavedBc

            /**
             * Checking if the action is `selectTableCellInit` called for another row or another widget
             */
            const selectedCell = state.view.selectedCell
            const isSelectTableCellInitOnAnotherRowOrWidget = selectedCell && isSelectTableCellInit &&
                (selectedCell.widgetName !== action.payload.widgetName || selectedCell.rowId !== action.payload.rowId)


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
            const isNeedSaveCondition = isNotSaveAction &&
                (
                    isSendOperationForAnotherBc
                    || isSelectTableCellInitOnAnotherRowOrWidget
                )
            /**
             * Default save operation CRUD
             */
            if (isNeedSaveCondition) {
                return autosaveRoutine(action, { getState, dispatch }, next)
            }

            return next(action)
        }

/**
 *
 */
export function createAutoSaveMiddleware() {
    return saveFormMiddleware
}
