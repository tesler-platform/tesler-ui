import {AnyAction, types} from '../actions/actions'
import {Session} from '../interfaces/session'

const initialState: Session  = {
    active: false,
    loginSpin: false,
    errorMsg: null,
    screens: []
}

/**
 * Session reducer
 * 
 * Stores information about currently active session and data that should be persistent during all period of
 * user interaction with application.
 *
 * @param state Session branch of Redux store 
 * @param action Redux action
 * @param store Store instance for read-only access of different branches of Redux store
 */
export function session(state = initialState, action: AnyAction): Session {
    switch (action.type) {
        case types.login: {
            return { ...state, loginSpin: true, errorMsg: null }
        }
        case types.loginDone: {
            return { ...state, loginSpin: false, active: true, screens: action.payload.screens || [] }
        }
        case types.loginFail: {
            return { ...state, loginSpin: false, errorMsg: action.payload.errorMsg }
        }
        default:
            return state
    }
}

export default session
