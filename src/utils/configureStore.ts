import { Action, applyMiddleware, compose, createStore, Middleware, Store, StoreCreator } from 'redux'
import { createEpicMiddleware, Epic, combineEpics as legacyCombineEpics } from 'redux-observable'
import { reducers as coreReducers } from '../reducers/index'
import combineEpics from '../utils/combineEpics'
import { legacyCoreEpics } from '../epics'
import { combineMiddlewares } from '../utils/combineMiddlewares'
import { middlewares as coreMiddlewares } from '../middlewares'
import CustomEpics, { isLegacyCustomEpics } from '../interfaces/customEpics'
import { combineReducers } from '../utils/redux'
import { AnyAction } from '../actions/actions'
import { ClientReducersMapObject, CombinedReducersMapObject, CoreReducer, Store as CoreStore } from '../interfaces/store'
import { CustomMiddlewares } from '../interfaces/customMiddlewares'

/**
 * TODO
 *
 * @param storeCreator
 */
function withLogger(storeCreator: StoreCreator): StoreCreator {
    return (window as any).__REDUX_DEVTOOLS_EXTENSION__ ? (window as any).__REDUX_DEVTOOLS_EXTENSION__()(storeCreator) : storeCreator
}

/**
 * Configures Redux store by apply redux-observable epic middleware and custom version of `combineReducers` function
 *
 * @param customReducers Client application reducers
 * @param customEpics Client application epics
 * @param customEpicsDependencies Injecting Dependencies Into Epics
 * @param useEpics Can be set to `false` if client application does not provide redux-observable peer dependency
 * and does not rely on Tesler epics (e.g. importing only UI components)
 * @param customMiddlewares Any additional middlewares provided by client application
 */
export function configureStore<ClientState, ClientActions extends Action<any>>(
    customReducers = {} as ClientReducersMapObject<ClientState, ClientActions>,
    customEpics: CustomEpics | Epic<any, ClientState> = null,
    customEpicsDependencies: Record<string, any> = {},
    useEpics = true,
    customMiddlewares: CustomMiddlewares = null
): Store<ClientState & CoreStore> {
    type CombinedActions = AnyAction & ClientActions
    // If core reducer slices have a matching client app reducer slice
    // launch the core first and then client
    // TODO: Extract this to an utility
    const reducers = { ...coreReducers } as CombinedReducersMapObject<CoreStore & ClientState, CombinedActions>
    Object.keys(customReducers).forEach((reducerName: Extract<keyof ClientState, string>) => {
        const coreInitialState = coreReducers[reducerName]?.(undefined, { type: ' UNKNOWN ACTION ' })
        const reducerInitialState = {
            ...(coreInitialState || ({} as ClientState)),
            ...customReducers[reducerName].initialState
        }

        if (reducers[reducerName as keyof ClientState] && !customReducers[reducerName].override) {
            const combined: CoreReducer<ClientState[keyof ClientState], CombinedActions> = (
                state = reducerInitialState,
                action,
                getStore
            ) => {
                const storeAfterCore = coreReducers[reducerName](state, action, getStore)
                return customReducers[reducerName as keyof ClientState].reducer(storeAfterCore, action, getStore, state)
            }
            reducers[reducerName as keyof ClientState] = combined
        } else {
            reducers[reducerName as keyof ClientState] = customReducers[reducerName].reducer
        }
    })

    const middlewares: Middleware[] = combineMiddlewares(coreMiddlewares, customMiddlewares)

    let epicMiddleware

    if (useEpics) {
        epicMiddleware = createEpicMiddleware({
            dependencies: {
                /**
                 * TODO
                 *
                 * Needed for backward compatibility to be able to call store.dispatch.
                 * The use of store.dispatch is not recommended,
                 * so this feature was removed in rxjs6.
                 * For more details see the documentation
                 */
                get store() {
                    return store
                },
                ...customEpicsDependencies
            }
        })
        middlewares.push(epicMiddleware)
    }

    const store = compose(applyMiddleware(...middlewares))(withLogger(createStore))(combineReducers(reducers))

    if (useEpics) {
        const epics = isLegacyCustomEpics(customEpics) ? legacyCombineEpics(legacyCoreEpics, customEpics) : combineEpics(customEpics)
        epicMiddleware.run(epics)
    }

    return store
}
