import {$do, AnyAction, types} from '../actions/actions'
import {createHashHistory, parsePath} from 'history'
import {Route, RouteType} from '../interfaces/router'
import {shallowCompare} from '../utils/redux'
import {parseLocation, store} from '../Provider'

/* Общий инстанс истории для всего приложения */
export const historyObj = createHashHistory()

export function changeLocation(href: string) {
    historyObj.push(href)
}

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

const initialState: Route = {type: RouteType.default, path: '/', params: null, screenName: null}

export function router(state: Route = initialState, action: AnyAction ): Route {
    switch (action.type) {
        case types.loginDone:
            return parseLocation(historyObj.location)
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
