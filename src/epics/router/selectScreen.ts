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

import { of as observableOf, Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { Epic, types, AnyAction, ActionsMap, $do } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { ofType, StateObservable } from 'redux-observable'

/**
 *
 * TODO: Rename to `selectScreen` in 2.0.0
 *
 * @param action$ `selectScreen` action
 * @param store$
 */
export const changeScreen: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.selectScreen),
        switchMap(action => {
            return selectScreenImpl(action, store$)
        })
    )

/**
 *
 * @param action
 * @param store$
 * @category Epics
 */
export function selectScreenImpl(action: ActionsMap['selectScreen'], store$: StateObservable<CoreStore>): Observable<AnyAction> {
    const state = store$.value
    const nextViewName = state.router.viewName
    const requestedView = state.screen.views.find(item => item.name === nextViewName)
    const defaultView = !nextViewName && state.screen.primaryView && state.screen.views.find(item => item.name === state.screen.primaryView)
    const nextView = requestedView || defaultView || state.screen.views[0]
    return nextView
        ? observableOf<AnyAction>($do.selectView(nextView))
        : observableOf<AnyAction>($do.selectViewFail({ viewName: nextViewName }))
}
