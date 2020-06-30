/**
 * Process preInvoke operation before action sendOperation
 */

import {AnyAction, Dispatch, Middleware, MiddlewareAPI} from 'redux'
import {$do, types} from '../actions/actions'
import {Store as CoreStore} from '../interfaces/store'
import {buildBcUrl} from '../utils/strings'
import {Operation, OperationGroup} from '../interfaces/operation'

const preInvokeAction = ({getState, dispatch}: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>) => (next: Dispatch) =>
    (action: AnyAction) => {
        if (action.type === types.sendOperation) {
            const state = getState()
            const operationType = action.payload.operationType
            const widgetName = action.payload.widgetName
            const bcName = state.view.widgets.find(widgetItem => widgetItem.name === widgetName).bcName
            const bcUrl = buildBcUrl(bcName, true)
            const rowMeta = bcUrl && state.view.rowMeta[bcName]?.[bcUrl]
            const actions: Operation[] = []
            rowMeta.actions.forEach(item => {
                if ((item as OperationGroup).actions) {
                    const currentOperation = item as OperationGroup
                    currentOperation.actions.forEach(OperationItem => {
                        actions.push(OperationItem)
                    })
                } else {
                    actions.push(item as Operation)
                }
            })
            const preInvoke = actions.find(item => item.type === operationType)?.preInvoke

            return preInvoke && !action.payload.confirm
                ? next($do.processPreInvoke({
                    bcName,
                    operationType,
                    widgetName,
                    preInvoke,
                }))
                : next(action)
        }
        return next(action)
    }

/**
 * TODO
 */
export function createPreInvokeMiddleware() {
    return preInvokeAction as Middleware
}
