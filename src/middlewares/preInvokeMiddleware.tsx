/**
 * Process preInvoke operation before action sendOperation
 */

import {AnyAction, Dispatch, Middleware, MiddlewareAPI} from 'redux'
import {$do, types} from '../actions/actions'
import {Store as CoreStore} from '../interfaces/store'

const preInvokeAction = ({getState, dispatch}: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>) => (next: Dispatch) =>
    (action: AnyAction) => {
        if (action.type === types.sendOperation) {
            const bcName = action.payload.bcName
            const operationType = action.payload.operationType
            const widgetName = action.payload.widgetName
            const preInvoke = action.payload?.confirmOperation

            return preInvoke
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