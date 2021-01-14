/*
 * TESLER-UI
 * Copyright (C) 2018-2021 Tesler Contributors
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

import { Observable } from 'rxjs'
import { Store } from 'redux'
import { Epic, types, AnyAction, ActionsMap, $do } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { RouteType } from '../../interfaces/router'
import { parseBcCursors } from '../../utils/history'

/**
 * Epic of changing the current route
 *
 * Checks route parameters (screen, view, BC cursors) relative to those
 * that are currently stored in the store, and in case of a mismatch
 * initiates reloading the screen, view or BC with new cursors.
 *
 * @param action$ changeLocation
 */
export const changeLocation: Epic = (action$, store) =>
    action$.ofType(types.changeLocation).mergeMap(action => {
        return changeLocationImpl(action, store)
    })

/**
 *
 * @param action
 * @param store
 * @category Epics
 */
function changeLocationImpl(
    // completely ignored, handled in reducer
    action: ActionsMap['changeLocation'],
    store: Store<CoreStore>
): Observable<AnyAction> {
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
    const defaultScreenName = state.session.screens.find(screen => screen.defaultScreen)?.name || state.session.screens[0]?.name
    const nextScreenName = state.router.type === RouteType.default ? defaultScreenName : state.router.screenName

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
    const cursorsDiffMap: Record<string, string> = {}
    Object.entries(nextCursors).forEach(entry => {
        const [bcName, cursor] = entry
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
        resultObservables.push(Observable.of($do.bcChangeCursors({ cursorsMap: cursorsDiffMap })))
    }
    // reload view if not equ
    if (needUpdateViews) {
        const nextView = nextViewName
            ? state.screen.views.find(item => item.name === nextViewName)
            : state.screen.primaryView
            ? state.screen.views.find(item => item.name === state.screen.primaryView)
            : state.screen.views[0]
        resultObservables.push(
            nextView ? Observable.of($do.selectView(nextView)) : Observable.of($do.selectViewFail({ viewName: nextViewName }))
        )
    }
    // If CURSOR has been updated but VIEW has`t changed, need update DATA
    if (needUpdateCursors && !needUpdateViews) {
        Object.entries(nextCursors).forEach(entry => {
            const [bcName, cursor] = entry
            if (!state.data[bcName].find(item => item.id === cursor)) {
                resultObservables.push(Observable.of($do.bcForceUpdate({ bcName })))
            }
        })
    }
    // The order is important (cursors are placed first, then the view is reloaded)
    return Observable.concat(...resultObservables)
}
