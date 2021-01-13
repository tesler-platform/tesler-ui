import session from './session'
import router from './router'
import screen from './screen'
import view from './view'
import data from './data'
import { Store, CombinedReducersMapObject } from '../interfaces/store'
import { AnyAction } from '../actions/actions'
import depthData from './depthData'

export const reducers: CombinedReducersMapObject<Store, AnyAction> = {
    router,
    session,
    screen,
    view,
    data,
    depthData
}
