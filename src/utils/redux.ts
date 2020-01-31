import {Dispatch, ReducersMapObject, Reducer} from 'redux'
import {MapDispatchToPropsFactory} from 'react-redux'
import {ObjectMap} from '../interfaces/objectMap'
import {CombinedReducersMapObject} from '../interfaces/store'
import {AnyAction} from '../actions/actions'

/**
 * Схлапывает словарь редьюсеров в один общий редьюсер, который последовательно
 * прогоняет экшн через все редьюсеры словаря чтобы получить итоговое состояние.
 *
 * Работает аналогично оригинальному combineReducers, но добавляет редьюсерам
 * третий аргумент, через который можно получить текущее состояние store, чтобы иметь
 * возможность обращаться к веткам других редьюсеров.
 * 
 * @param reducers Словарь редьюсеров
 */
export function combineReducers<State>(
    reducers: ReducersMapObject<State, AnyAction> | CombinedReducersMapObject<State, AnyAction> ,
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
            hasChanged = hasChanged || (nextStateForKey !== prevStateForKey)
        }
        return hasChanged ? nextState : state
    }
    return combination
}

/**
 * Сравнивает свойства двух объектов и возвращает список строго несовпадающих
 * TODO: JSDoc
 *
 * @param prevProps 
 * @param nextProps 
 * @param ignore 
 */
export function shallowCompare(prevProps: ObjectMap<any>, nextProps: ObjectMap<any>, ignore: string[] = []) {
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
    newKeys.forEach((key) => {
        if (prevProps[key] !== nextProps[key] && !ignore.includes(key)) {
            diffProps.push(key)
        }
    })
    Object.keys(prevProps).forEach((key) => {
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
