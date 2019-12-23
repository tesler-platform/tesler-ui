import {AnyAction, types} from '../actions/actions'
import {Session} from '../interfaces/session'

const initialState: Session  = {
    active: false,
    loginSpin: false,
    errorMsg: null,
    screens: []
}

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
