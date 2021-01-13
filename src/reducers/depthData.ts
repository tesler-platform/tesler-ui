import { AnyAction, types } from '../actions/actions'
import { DepthDataState } from '../interfaces/data'

const initialState: DepthDataState = {}

/**
 * TODO
 */
export function depthData(state = initialState, action: AnyAction) {
    switch (action.type) {
        case types.bcFetchDataSuccess: {
            return !action.payload.depth || action.payload.depth < 2
                ? state
                : {
                      ...state,
                      [action.payload.depth]: {
                          ...state[action.payload.depth],
                          [action.payload.bcName]: action.payload.data
                      }
                  }
        }
        case types.selectView: {
            return initialState
        }
        default:
            return state
    }
}

export default depthData
