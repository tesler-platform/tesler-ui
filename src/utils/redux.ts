import { Dispatch, ReducersMapObject, Reducer } from 'redux'
import { MapDispatchToPropsFactory } from 'react-redux'
import { CombinedReducersMapObject } from '../interfaces/store'
import { AnyAction } from '../actions/actions'

/**
 * Combines a dictionary of reducers for different slices of the store into one
 * root reducer.
 *
 * Effectively works like default redux `combineReducers` but provides access to the store
 * via the third argument to allow reducers read only access to other slices
 * (simplifies callbacks, epics and actions' payloads).
 *
 * @param reducers A dictionary of reducers for different slices of the redux store
 * @category Utils
 */
export function combineReducers<State>(
    reducers: ReducersMapObject<State, AnyAction> | CombinedReducersMapObject<State, AnyAction>
): Reducer<State, AnyAction> {
    const combination: Reducer<State, AnyAction> = (state = {} as State, action: AnyAction) => {
        const nextState = { ...state }
        let hasChanged = false
        for (const reducerName in reducers) {
            if (!Object.prototype.hasOwnProperty.call(reducers, reducerName)) {
                continue
            }
            const prevStateForKey = state[reducerName]
            const reducer = reducers[reducerName]
            const nextStateForKey = (reducer as any)(prevStateForKey, action, nextState) as State[Extract<keyof State, string>]
            nextState[reducerName] = nextStateForKey
            hasChanged = hasChanged || nextStateForKey !== prevStateForKey
        }
        return hasChanged ? nextState : state
    }
    return combination
}

/**
 * Shallow compare of two dictionaries by strict comparison.
 * `ignore` argument can be used to forcefully exclude some properties from result set even if their
 * are different.
 *
 * TODO: Check if possible to replace with `shallowEqual` from `react-redux`
 *
 * @param prevProps
 * @param nextProps
 * @param ignore
 */
export function shallowCompare(prevProps: Record<string, any>, nextProps: Record<string, any>, ignore: string[] = []) {
    const diffProps: string[] = []
    if (!prevProps && !nextProps) {
        return null
    }
    if (!prevProps) {
        return Object.keys(nextProps)
    }
    if (!nextProps) {
        return Object.keys(prevProps)
    }
    const newKeys = Object.keys(nextProps)
    newKeys.forEach(key => {
        if (prevProps[key] !== nextProps[key] && !ignore.includes(key)) {
            diffProps.push(key)
        }
    })
    Object.keys(prevProps).forEach(key => {
        if (!newKeys.includes(key)) {
            diffProps.push(key)
        }
    })
    return diffProps
}

/**
 * TODO: JSDoc
 */
class ActionsContext<T> {
    /**
     * TODO
     */
    dispatch: Dispatch<any> = null

    /**
     * TODO
     */
    props: T = null
}

/**
 * TODO: JSDoc
 *
 * @param contextCreator
 * @param actionsCreator
 */
export function createMapDispatchToProps<ContextProps, Actions, OwnProps>(
    contextCreator: (props: OwnProps) => ContextProps,
    actionsCreator: (context: ActionsContext<ContextProps>) => Actions
): MapDispatchToPropsFactory<Actions, OwnProps> {
    return (initDispatch, initProps) => {
        const context = new ActionsContext<ContextProps>()
        const actions = actionsCreator(context)
        context.dispatch = initDispatch
        return (dispatch, props) => {
            context.props = contextCreator(props)
            return actions
        }
    }
}
