import { $do, types } from '../../actions/actions'
import { configureStore } from '../configureStore'
import * as router from '../../Provider'
import { LoginResponse } from '../../interfaces/session'

jest.spyOn(router, 'parseLocation').mockImplementation(() => {
    return { screenName: null, viewName: null, type: null, path: null, params: null }
})

const loginResponce: LoginResponse = {
    screens: null,
    activeRole: null,
    roles: null,
    firstName: null,
    lastName: null,
    login: null
}
describe('configureStore', () => {
    it('handles built-in actions by built-in reducers', () => {
        const store = configureStore({}, null, false, null)
        expect(store.getState().session.active).toBe(false)
        store.dispatch($do.loginDone(loginResponce))
        expect(store.getState().session.active).toBe(true)
    })

    it('applies custom reducer after Tesler built-in reducer', () => {
        const mock = jest.fn()
        const storeInstance = configureStore(
            {
                session: {
                    initialState: {},
                    reducer: (state, action, store, originalState) => {
                        if (action.type === types.loginDone) {
                            mock('success')
                            return state
                        }
                        return state
                    }
                }
            },
            null,
            false,
            null
        )
        expect(storeInstance.getState().session.active).toBe(false)
        storeInstance.dispatch($do.loginDone(loginResponce))
        expect(storeInstance.getState().session.active).toBe(true)
        expect(mock).toBeCalledWith('success')
    })

    it('allows custom reducer to override built-in implementation ', () => {
        const mock = jest.fn()
        const storeInstance = configureStore(
            {
                session: {
                    initialState: {},
                    reducer: (state, action, store, originalState) => {
                        if (action.type === types.loginDone) {
                            mock('success')
                            return originalState
                        }
                        return state
                    }
                }
            },
            null,
            false,
            null
        )
        expect(storeInstance.getState().session.active).toBe(false)
        storeInstance.dispatch($do.loginDone(loginResponce))
        expect(storeInstance.getState().session.active).toBe(false)
        expect(mock).toBeCalledWith('success')
    })

    it('allows reducers for custom store slice', () => {
        const storeInstance = configureStore(
            {
                customSlice: {
                    initialState: 0,
                    reducer: (state = 0, action, store, originalState) => {
                        if (action.type === types.loginDone) {
                            return 1
                        }
                        return state
                    }
                }
            },
            null,
            false,
            null
        )
        expect(storeInstance.getState().customSlice).toBe(0)
        storeInstance.dispatch($do.loginDone(loginResponce))
        expect(storeInstance.getState().customSlice).toBe(1)
    })
})
