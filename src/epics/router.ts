/**
 * Для эпиков работы с маршрутизацией
 */
import {combineEpics} from 'redux-observable'
import {$do, AnyAction, Epic, types} from '../actions/actions'
import {Observable} from 'rxjs/Observable'
import * as api from '../api/api'
import {historyObj} from '../reducers/router'
import {ObjectMap} from '../interfaces/objectMap'
import {makeRelativeUrl, parseBcCursors} from '../utils/history'
import {buildBcUrl} from '../utils/strings'
import {DrillDownType, RouteType} from '../interfaces/router'

/**
 * Эпик смены текущего маршрута
 *
 * Проверяет параметры маршрута (скрин, вью, курсоры БК) относительно тех,
 * что сейчас хранятся в сторе, и в случае несовпадения инициирует перезагрузку
 * скрина, вьюхи или БК с новыми курсорами.
 */
const changeLocation: Epic = (action$, store) => action$.ofType(types.changeLocation)
.mergeMap(action => {
    const state = store.getState()

    // пользователь еще не авторизовался
    if (!state.session.active) {
        return Observable.empty()
    }

    if (state.router.type === RouteType.router) {
        return Observable.of($do.handleRouter(state.router))
    }

    // Если скрины не совпали, то надо просто их перезагрузить и все,
    // т.к. вьюхи и курсоры зависят от скрина и перестают быть актуальны
    const currentScreenName = state.screen.screenName
    const nextScreenName = state.router.screenName
    if (nextScreenName !== currentScreenName) {
        const nextScreen = state.session.screens.find(item => item.name === nextScreenName)
        return nextScreen
            ? Observable.of($do.selectScreen({ screen: nextScreen }))
            : Observable.of($do.selectScreenFail({ screenName: nextScreenName }))
    }
    // Проверить, есть ли расхождение по курсорам БК в урле и в сторе
    const currentViewName = state.view.name
    const nextViewName = state.router.viewName
    const nextCursors = parseBcCursors(state.router.bcPath) || {}
    const cursorsDiffMap: ObjectMap<string> = {}
    Object.entries(nextCursors).forEach(entry => {
        const [ bcName, cursor ] = entry
        const bc = state.screen.bo.bc[bcName]
        if (!bc || bc && bc.cursor !== cursor) {
            cursorsDiffMap[bcName] = cursor
        }
    })
    const needUpdateCursors = Object.keys(cursorsDiffMap).length
    const needUpdateViews = nextViewName !== currentViewName
    const resultObservables: Array<Observable<AnyAction>> = []
    // Если расхождение есть, то проставить новые и пометить такие БК "грязными"
    if (needUpdateCursors) {
        resultObservables.push(
            Observable.of($do.bcChangeCursors({ cursorsMap: cursorsDiffMap }))
        )
    }
    // Если не совпала вьюха, то ее тоже надо перезагрузить
    if (needUpdateViews) {
        const nextView = nextViewName
            ? state.screen.views.find(item => item.name === nextViewName)
            : state.screen.views[0]
        resultObservables.push(
            nextView
                ? Observable.of($do.selectView(nextView))
                : Observable.of($do.selectViewFail({ viewName: nextViewName}))
        )
    }
    // Порядок важен (сначала проставляются курсоры, потом перезагружается вьюха)
    return Observable.concat(...resultObservables)
})

const loginDone: Epic = (action$, store) => action$.ofType(types.loginDone)
.switchMap(action => {
    const state = store.getState()

    if (state.router.type === RouteType.router) {
        return Observable.of($do.handleRouter(state.router))
    }

    const nextScreenName = state.router.screenName
    const nextScreen = state.session.screens.find(item => nextScreenName
            ? item.name === nextScreenName
            : item.defaultScreen
        ) || state.session.screens[0]
    return nextScreen
        ? Observable.of<AnyAction>($do.selectScreen({ screen: nextScreen }))
        : Observable.of<AnyAction>($do.selectScreenFail({ screenName: nextScreenName }))
})

const changeScreen: Epic = (action$, store) => action$.ofType(types.selectScreen)
.switchMap(action => {
    const state = store.getState()
    const nextViewName = state.router.viewName
    const requestedView = state.screen.views.find(item => item.name === nextViewName)
    const defaultView = !nextViewName && state.screen.primaryView && state.screen.views
    .find(item => item.name === state.screen.primaryView)
    const nextView = requestedView
        || defaultView
        || state.screen.views[0]
    return nextView
        ? Observable.of<AnyAction>($do.selectView(nextView))
        : Observable.of<AnyAction>($do.selectViewFail({ viewName: nextViewName }))
})

const changeView: Epic = (action$, store) => action$.ofType(types.selectView)
.switchMap(action => {
    const state = store.getState()
    const nextCursors = parseBcCursors(state.router.bcPath) || {}
    const cursorsDiffMap: ObjectMap<string> = {}
    Object.entries(nextCursors).forEach(entry => {
        const [ bcName, cursor ] = entry
        const bc = state.screen.bo.bc[bcName]
        if (!bc || bc && bc.cursor !== cursor) {
            cursorsDiffMap[bcName] = cursor
        }
    })
    if (Object.keys(cursorsDiffMap).length) {
        return Observable.of($do.bcChangeCursors({ cursorsMap: cursorsDiffMap }))
    }
    return Observable.empty()
})

const drillDown: Epic = (action$, store) => action$.ofType(types.drillDown)
.switchMap(action => {
    // const state = store.getState() as Store
    const url = action.payload.url
    switch (action.payload.drillDownType) {
        case 'inner':
        default:
            historyObj.push(makeRelativeUrl(url))
            break
    }
    return Observable.empty()
})

const userDrillDown: Epic = (action$, store) => action$.ofType(types.userDrillDown)
.map(action => {
    store.dispatch(
        $do.bcChangeCursors({ cursorsMap: { [action.payload.bcName]: action.payload.cursor } })
    )
    return action
})
.switchMap(action => {
    const state = store.getState()
    const {bcName, fieldKey} = action.payload
    const bcUrl = buildBcUrl(bcName, true)
    const fetch = api.fetchRowMeta(state.screen.screenName, bcUrl)
    return fetch
    .mergeMap(rowMeta => {
        const drillDownField = rowMeta.fields.find(field => field.key === fieldKey)
        const route = state.router
        return drillDownField && drillDownField.drillDown
            ? Observable.concat(
                Observable.of($do.userDrillDownSuccess({ bcName, bcUrl, cursor: action.payload.cursor })),
                Observable.of($do.drillDown({
                    url: drillDownField.drillDown,
                    drillDownType: drillDownField.drillDownType as DrillDownType,
                    route
                }))
            )
            : Observable.empty<never>()
    })
    .catch(error => {
        console.error(error)
        return Observable.empty() // TODO:
    })
})

const handleRouter: Epic = (action$, store) => action$.ofType(types.handleRouter)
.switchMap(action => {
    const path = action.payload.path
    const params = action.payload.params
    // todo: Обработка ошибок
    return api.routerRequest(path, params).mergeMap(data => {
        return Observable.empty<never>()
    })
    .catch(error => {
        console.error(error)
        return Observable.empty()
    })
})

export const routerEpics = combineEpics(
    changeLocation,
    loginDone,
    changeScreen,
    changeView,
    drillDown,
    userDrillDown,
    handleRouter
)
