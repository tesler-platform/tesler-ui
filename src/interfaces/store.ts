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
    [reducerName: string]: any // TODO: Исправить комбинирование редьюсеров и убрать
}

export type CoreReducer<ReducerState, ClientActions, State = Store> = (
    state: ReducerState,
    action: AnyAction & ClientActions,
    store?: Readonly<State>
) => ReducerState

export interface ClientReducer<ReducerState, ClientActions> {
    initialState: ReducerState
    override?: boolean
    reducer: CoreReducer<ReducerState, ClientActions>
}

export type ClientReducersMapObject<ClientStore, ClientActions> = {
    [reducerName in keyof ClientStore]: ClientReducer<ClientStore[keyof ClientStore], ClientActions>
}

export type CombinedReducersMapObject<ReducerState, ClientActions> = {
    [reducerName in keyof ReducerState]: CoreReducer<ReducerState[keyof ReducerState], ClientActions, ReducerState>
}
