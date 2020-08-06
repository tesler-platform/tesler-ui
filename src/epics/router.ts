/**
 * Для эпиков работы с маршрутизацией
 */
import {$do, AnyAction, Epic, types} from '../actions/actions'
import {Observable} from 'rxjs/Observable'
import * as api from '../api/api'
import {historyObj} from '../reducers/router'
import {ObjectMap} from '../interfaces/objectMap'
import {makeRelativeUrl, parseBcCursors} from '../utils/history'
import {buildBcUrl} from '../utils/strings'
import {DrillDownType, RouteType} from '../interfaces/router'
import qs from 'query-string'
import {defaultParseLocation} from '../Provider'
import {shallowCompare} from '../utils/redux'
import {parsePath} from 'history'
import {parseFilters, parseSorters} from '../utils/filters'

/**
 * Epic of changing the current route
 *
 * Checks route parameters (screen, view, BC cursors) relative to those
 * that are currently stored in the store, and in case of a mismatch
 * initiates reloading the screen, view or BC with new cursors.
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

    // Reload screen if nextScreen and currentScreen not equal
    // With the default route type use the first default screen, if not exist then first screen
    const currentScreenName = state.screen.screenName
    const defaultScreenName = state.session.screens.find(screen => screen.defaultScreen)?.name
        || state.session.screens[0]?.name
    const nextScreenName = state.router.type === RouteType.default
        ? defaultScreenName
        : state.router.screenName
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
        if (!bc || bc?.cursor !== cursor) {
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
            : state.screen.primaryView
                ? state.screen.views.find(item => item.name === state.screen.primaryView)
                : state.screen.views[0]
        resultObservables.push(
            nextView
                ? Observable.of($do.selectView(nextView))
                : Observable.of($do.selectViewFail({ viewName: nextViewName}))
        )
    }
    // If CURSOR has been updated but VIEW has`t changed, need update DATA
    if (needUpdateCursors && !needUpdateViews) {
        Object.entries(nextCursors).forEach(entry => {
            const [ bcName, cursor ] = entry
            if (!state.data[bcName].find(item => item.id === cursor)) {
                resultObservables.push(
                    Observable.of($do.bcForceUpdate({ bcName }))
                )
            }
        })
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
        if (!bc || bc?.cursor !== cursor) {
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
    const state = store.getState()
    const url = action.payload.url
    switch (action.payload.drillDownType) {
        case DrillDownType.external:
            window.location.href = url
            break
        case DrillDownType.externalNew:
            if (/^[a-z0-9]+:\/\//i.test(url)) {
                window.open(url)
            }
            break
        case DrillDownType.relative:
            window.location.href = `${window.location.origin}/${url}`
            break
        case DrillDownType.relativeNew:
            window.open(`${window.location.origin}/${url}`, '_blank')
            break
        case DrillDownType.inner:
        default:
            const [urlBase, urlParams] = url.split('?')
            const urlFilters = qs.parse(urlParams).filters
            const urlSorters = qs.parse(urlParams).sorters
            if (urlFilters || urlSorters) {
                const prevState = state.router
                const nextState = defaultParseLocation(parsePath(urlBase))
                const diff = shallowCompare(prevState, nextState, ['params'])
                try {
                    if (urlFilters) {
                        const filters = JSON.parse(urlFilters)
                        Object.keys(filters).map((bcName) => {
                            if (filters[bcName].length) {
                                const parsedFilters = parseFilters(filters[bcName])
                                parsedFilters.forEach((item) => {
                                    store.dispatch($do.bcAddFilter({bcName, filter: item}))
                                    store.dispatch($do.bcForceUpdate({bcName}))
                                })
                                if (!diff.length) {
                                    store.dispatch($do.bcForceUpdate({bcName}))
                                }
                            } else {
                                store.dispatch($do.bcRemoveAllFilters({bcName}))
                                store.dispatch($do.bcForceUpdate({bcName}))
                            }
                        })
                    }
                    if (urlSorters) {
                        const sorters = JSON.parse(urlSorters)
                        Object.keys(sorters).map((bcName) => {
                            const parsedSorters = parseSorters(sorters[bcName])
                            store.dispatch($do.bcAddSorter({bcName, sorter: parsedSorters}))
                            if (!diff.length) {
                                store.dispatch($do.bcForceUpdate({bcName}))
                            }
                        })
                    }
                } catch (e) {
                    console.warn(e)
                }
            }
            historyObj.push(makeRelativeUrl(urlBase))
            break
    }
    return Observable.empty()
})

const userDrillDown: Epic = (action$, store) => action$.ofType(types.userDrillDown)
.map(action => {
    const state = store.getState()
    const widget = state.view.widgets.find(item => item.name === action.payload.widgetName)
    const cursor = state.screen.bo.bc[widget?.bcName]?.cursor
    if (cursor !== action.payload.cursor) {
        store.dispatch(
            $do.bcChangeCursors({ cursorsMap: { [action.payload.bcName]: action.payload.cursor } })
        )
    }
    return action
})
.switchMap(action => {
    const state = store.getState()
    const {bcName, fieldKey, cursor} = action.payload
    const bcUrl = buildBcUrl(bcName, true)
    const fetch = api.fetchRowMeta(state.screen.screenName, bcUrl)
    return fetch
    .mergeMap(rowMeta => {
        const drillDownField = rowMeta.fields.find(field => field.key === fieldKey)
        const route = state.router
        return drillDownField?.drillDown || drillDownField?.drillDown !== route.path
            ? Observable.concat(
                (drillDownField.drillDownType !== DrillDownType.inner)
                    ? Observable.of($do.bcFetchRowMetaSuccess({bcName, rowMeta, bcUrl, cursor}))
                    : Observable.empty<never>(),
                Observable.of($do.userDrillDownSuccess({bcName, bcUrl, cursor})),
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

export const routerEpics = {
    changeLocation,
    loginDone,
    changeScreen,
    changeView,
    drillDown,
    userDrillDown,
    handleRouter
}
