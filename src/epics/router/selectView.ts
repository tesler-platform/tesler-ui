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

import { of as observableOf, Observable, EMPTY } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { Epic, types, AnyAction, ActionsMap, $do } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { parseBcCursors } from '../../utils/history'
import { ofType, StateObservable } from 'redux-observable'

/**
 *
 * TODO: Rename to `selectView` in 2.0.0
 *
 * @param action$ `selectView` action
 * @param store$
 */
export const changeView: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.selectView),
        switchMap(action => {
            return selectViewImpl(action, store$)
        })
    )

/**
 *
 * @param action
 * @param store$
 * @category Epics
 */
export function selectViewImpl(action: ActionsMap['selectView'], store$: StateObservable<CoreStore>): Observable<AnyAction> {
    const state = store$.value
    const nextCursors = parseBcCursors(state.router.bcPath) || {}
    const cursorsDiffMap: Record<string, string> = {}
    Object.entries(nextCursors).forEach(entry => {
        const [bcName, cursor] = entry
        const bc = state.screen.bo.bc[bcName]
        if (!bc || bc.cursor !== cursor) {
            cursorsDiffMap[bcName] = cursor
        }
    })
    if (Object.keys(cursorsDiffMap).length) {
        return observableOf($do.bcChangeCursors({ cursorsMap: cursorsDiffMap }))
    }
    return EMPTY
}
