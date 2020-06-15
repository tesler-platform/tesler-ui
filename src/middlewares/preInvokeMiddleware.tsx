/**
 * Process preInvoke operation before action sendOperation
 */

import {AnyAction, Dispatch, Middleware, MiddlewareAPI} from 'redux'
import {$do, types} from '../actions/actions'
import {Store as CoreStore} from '../interfaces/store'
import {buildBcUrl} from '..'
import {isOperationGroup, Operation} from '../interfaces/operation'

const preInvokeAction = ({getState, dispatch}: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>) => (next: Dispatch) =>
    (action: AnyAction) => {
        if (action.type === types.sendOperation) {
            const state = getState()
            console.log(state)
            const bcName = action.payload.bcName
            const bcUrl = buildBcUrl(bcName, true)
            const operationType = action.payload.operationType
            const widgetName = action.payload.widgetName
            const operations: Operation[] = []
            state.view.rowMeta[bcName][bcUrl].actions.forEach(item => {
                if (isOperationGroup(item)) {
                    item.actions.forEach(operation => {operations.push(operation)})
                } else {
                    operations.push(item)
                }
            })
            const preInvoke = operations?.filter(item => item.type === operationType && item?.preInvoke)[0]?.preInvoke
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
