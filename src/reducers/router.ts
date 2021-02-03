import { $do, AnyAction, types } from '../actions/actions'
import { createHashHistory, parsePath } from 'history'
import { Route, RouteType } from '../interfaces/router'
import { shallowCompare } from '../utils/redux'
import { parseLocation, store } from '../Provider'

/**
 * Global instance
 *
 * @category Utils
 */
export const historyObj = createHashHistory()

/**
 * TODO
 *
 * @param href
 * @category Utils
 */
export function changeLocation(href: string) {
    historyObj.push(href)
}

/**
 * TODO
 */
export function initHistory() {
    historyObj.listen((loc, action) => {
        const prevState = store.getState().router
        const nextState = parseLocation(historyObj.location)
        const diff = shallowCompare(prevState, nextState)
        if (diff.length) {
            store.dispatch($do.changeLocation({ location: nextState, action }))
        }
    })
}

const initialState: Route = { type: RouteType.default, path: '/', params: null, screenName: null }

/**
 * Router reducer
 *
 * Stores information about currently active route
 *
 * @param state Router branch of Redux store
 * @param action Redux action
 * @param store Store instance for read-only access of different branches of Redux store
 */
export function router(state: Route = initialState, action: AnyAction): Route {
    switch (action.type) {
        case types.loginDone:
            return parseLocation(historyObj?.location)
        case types.changeLocation:
            const rawLocation = action.payload.rawLocation
            if (rawLocation != null) {
                const newState = parseLocation(parsePath(rawLocation))
                return newState
            }
            const parsedLocation = action.payload.location
            if (parsedLocation != null) {
                return parsedLocation
            }
            throw new Error('location reducer: action.payload.rawLocation == null & action.payload.location == null')
        default:
            return state
    }
}

export default router
