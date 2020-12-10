import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { Store as CoreStore } from '../interfaces/store'
import { ACTIONS_HISTORY } from '../utils/actionsHistory'

const actionsHistoryMiddleware = ({ getState, dispatch }: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>) => (next: Dispatch) => (
    action: AnyAction
) => {
    ACTIONS_HISTORY.push(action)
    return next(action)
}

export function createActionsHistoryMiddleware() {
    return actionsHistoryMiddleware
}
