import { createStore } from 'redux'
import { reducers } from '../reducers/index'
import { setStoreInstance } from '../Provider'
import { combineReducers } from '../utils/redux'

/**
 * redux-стор для использования в тестах
 *
 * Поддерживает редьюсеры, не поддерживает эпики (тестируются отдельно).
 */
export const mockStore = () => {
    const store = createStore(combineReducers(reducers))
    const origDispatch = store.dispatch
    store.dispatch = jest.fn(origDispatch)
    setStoreInstance(store)
    return store
}
