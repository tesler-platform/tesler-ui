import { Route } from './router'
import { Session } from './session'
import { ScreenState } from './screen'
import { ViewState } from './view'
import { DataState, DepthDataState } from './data'
import { AnyAction } from '../actions/actions'

export interface Store {
    router: Route
    session: Session
    screen: ScreenState
    view: ViewState
    data: DataState
    depthData: DepthDataState
    [reducerName: string]: any // TODO: Fix how reducers are combined and remove
}

export type CoreReducer<ReducerState, ClientActions, State = Store> = (
    /**
     * The state of Redux store slice
     */
    state: ReducerState,
    /**
     * Redux action
     */
    action: AnyAction & ClientActions,
    /**
     * Allows direct access to other slices of redux store from the reducer
     */
    store?: Readonly<State>,
    /**
     * The original state of Redux store slice before in went through Tesler reducer;
     *
     * Can be used to implement your own logic in client application reducer for built-in action.
     */
    originalState?: ReducerState
) => ReducerState

export interface ClientReducer<ReducerState, ClientActions> {
    /**
     * Initial state for Redux store slice; will replace built-in Tesler initial state for matching slice
     */
    initialState: ReducerState
    /**
     * If true than custom reducer will replace built-in Tesler reducer for this store slice
     *
     * @deprecated TODO: This functionality is conceptionally flawed and will be removed in 2.0.0
     */
    override?: boolean
    /**
     * Reducer function for specific store slice
     */
    reducer: CoreReducer<ReducerState, ClientActions>
}

export type ClientReducersMapObject<ClientStore, ClientActions> = {
    [reducerName in keyof ClientStore]: ClientReducer<ClientStore[keyof ClientStore], ClientActions>
}

export type CombinedReducersMapObject<ReducerState, ClientActions> = {
    [reducerName in keyof ReducerState]: CoreReducer<ReducerState[keyof ReducerState], ClientActions, ReducerState>
}
