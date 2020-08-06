import {AnyAction, Dispatch, MiddlewareAPI} from 'redux'
import {$do, needSaveAction, types} from '../actions/actions'
import {OperationTypeCrud} from '../interfaces/operation'
import {WidgetMeta} from '../interfaces/widget'
import {Store as CoreStore} from '../interfaces/store'

const saveFormMiddleware = ({ getState, dispatch }: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>) =>
    (next: Dispatch) =>
        (action: AnyAction) => {
            if (!needSaveAction(action.type)) {
                return next(action)
            }
            const state = getState()

            // TODO: Should offer to save pending changes or drop them

            const actionBcName = action.payload.bcName
            const isAnotherBc = Object.keys(state.view.pendingDataChanges)
                .filter(key => key !== actionBcName).length > 0
            const isSendOperation = action.type === types.sendOperation
            const needToSaveTableChanges = isSendOperation && isAnotherBc
            const selectedCell = state.view.selectedCell
            const isSelectTableCellInit = action.type === types.selectTableCellInit

            /**
             * Default save operation as custom action
             *
             * If widget have only custom actions, `defaultSave` option mean witch action
             * must be executed as save record.
             * Work only user initial `changeLocation` and don't work at postAction `drillDown`
             * @param ignorePostAction Indicate that postAction not needed (postAction.drillDown as example)
             */
            const defaultSaveWidget = state.view.widgets.find(item => item?.options?.actionGroups?.defaultSave)
            const defaultCursor = state.screen.bo.bc?.[defaultSaveWidget?.bcName]?.cursor
            const pendingData = state.view?.pendingDataChanges?.[defaultSaveWidget?.bcName]?.[defaultCursor]
            if (defaultSaveWidget && action.type === types.changeLocation && !action.ignoreAutosave && pendingData) {
                action.ignoreAutosave = true
                return next($do.sendOperation({
                    bcName: defaultSaveWidget.bcName,
                    operationType: defaultSaveWidget.options.actionGroups.defaultSave,
                    widgetName: defaultSaveWidget.name,
                    onSuccessAction: action,
                    ignorePostAction: true
                }))
            }

            /**
             * Default save operation
             *
             */

            if (selectedCell
                && (
                    needToSaveTableChanges
                    || (!isSelectTableCellInit && !isSendOperation)
                    || (isSelectTableCellInit &&
                        (selectedCell.widgetName !== action.payload.widgetName || selectedCell.rowId !== action.payload.rowId)
                    )
                )
            ) {
                const widget = state.view.widgets.find((v: WidgetMeta) => v.name === selectedCell.widgetName)
                const bcName = widget.bcName
                const cursor = state.screen.bo.bc[bcName]?.cursor
                if (cursor === selectedCell.rowId && bcHasPendingAutosaveChanges(state, bcName, cursor)) {
                    return next($do.sendOperation({
                        bcName: bcName,
                        operationType: OperationTypeCrud.save,
                        widgetName: widget.name,
                        onSuccessAction: action
                    }))
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
