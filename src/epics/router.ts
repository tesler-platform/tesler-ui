/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {$do, AnyAction, Epic, types} from '../actions/actions'
import {Observable} from 'rxjs/Observable'
import * as api from '../api/api'
import {ObjectMap} from '../interfaces/objectMap'
import {parseBcCursors} from '../utils/history'
import {buildBcUrl} from '../utils/strings'
import {DrillDownType, RouteType} from '../interfaces/router'
import {notification} from 'antd'
import i18n from 'i18next'
import {drillDown} from './router/drilldown'
import {WidgetFieldBase} from '../interfaces/widget'

/**
 * Epic of changing the current route
 *
 * Checks route parameters (screen, view, BC cursors) relative to those
 * that are currently stored in the store, and in case of a mismatch
 * initiates reloading the screen, view or BC with new cursors.
 *
 * @param action$ changeLocation
 */
const changeLocation: Epic = (action$, store) => action$.ofType(types.changeLocation)
.mergeMap(action => {
    const state = store.getState()

    // User not logged
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
    // Check cursor different between store and url
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
    // if cursors have difference, then put new cursors and mark BC as "dirty"
    if (needUpdateCursors) {
        resultObservables.push(
            Observable.of($do.bcChangeCursors({ cursorsMap: cursorsDiffMap }))
        )
    }
    // reload view if not equ
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
    // The order is important (cursors are placed first, then the view is reloaded)
    return Observable.concat(...resultObservables)
})

/**
 * Fires `selectScreen` or `selectScreenFail` to set requested in url screen as active
 * after succesful login.
 *
 * For server-side router fires `handleRouter` instead.
 *
 * @param action$ loginDone
 */
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
        const drillDownKey = (state.view.widgets
            .find(widget => widget.bcName === bcName)?.fields
            .find((field: WidgetFieldBase) => field.key === fieldKey) as WidgetFieldBase)?.drillDownKey
        const customDrillDownUrl = state.data?.[bcName]?.find(record => record.id === cursor)?.[drillDownKey] as string
        return customDrillDownUrl || drillDownField?.drillDown || drillDownField?.drillDown !== route.path
            ? Observable.concat(
                (drillDownField.drillDownType !== DrillDownType.inner)
                    ? Observable.of($do.bcFetchRowMetaSuccess({bcName, rowMeta, bcUrl, cursor}))
                    : Observable.empty<never>(),
                Observable.of($do.userDrillDownSuccess({bcName, bcUrl, cursor})),
                Observable.of($do.drillDown({
                    url: customDrillDownUrl || drillDownField.drillDown,
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

/**
 * Throws a error popup when attempting to navigate to the screen which is missing for current session
 *
 * @param action$ selectScreenFail
 */
const selectScreenFail: Epic = (action$) => action$.ofType(types.selectScreenFail)
.mergeMap(action => {
    notification.error({
        message: i18n.t('Screen is missing or unavailable for your role', { screenName: action.payload.screenName }),
        duration: 15
    })
    return Observable.empty()
})

/**
 * Throws a error popup when attempting to navigate to the view which is missing for current session
 *
 * @param action$ selectViewFail
 */
const selectViewFail: Epic = (action$) => action$.ofType(types.selectViewFail)
.mergeMap(action => {
    notification.error({
        message: i18n.t('View is missing or unavailable for your role', { viewName: action.payload.viewName }),
        duration: 15
    })
    return Observable.empty()
})

export const routerEpics = {
    changeLocation,
    loginDone,
    changeScreen,
    changeView,
    drillDown,
    userDrillDown,
    handleRouter,
    selectScreenFail,
    selectViewFail
}
