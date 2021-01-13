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

import { ActionsMap, $do, AnyAction, types, Epic } from '../../actions/actions'
import { Store } from 'redux'
import { Store as CoreStore } from '../../interfaces/store'
import { WidgetMeta } from '../../interfaces/widget'

/**
 * Schedules data fetch for every widget on the view
 *
 * After selecting a view, this epic schedules a data fetch for every widget present on the view.
 * If business componenet for the widget has a parent, then root ancestor BC is scheduled for data fetch instead
 * and data for its descendants will be scheduled after ancestor data fetch resolved.
 *
 * @see {@link src/epics/data/bcFetchDataEpic.ts} for details how descendants resolved
 * @param action `selectView` action
 * @param store Store instance
 */
export const selectView: Epic = (action$, store) =>
    action$.ofType(types.selectView).mergeMap(action => {
        return selectViewImpl(action, store)
    })

/**
 * Default implementation for `selectView` epic.
 *
 * Schedules data fetch for every widget on the view
 *
 * After selecting a view, this epic schedules a data fetch for every widget present on the view.
 * If business componenet for the widget has a parent, then root ancestor BC is scheduled for data fetch instead
 * and data for its descendants will be scheduled after ancestor data fetch resolved.
 *
 * @see {@link src/epics/data/bcFetchDataEpic.ts} for details how descendants resolved
 * @param action `selectView` action
 * @param store Store instance
 */
export function selectViewImpl(action: ActionsMap['selectView'], store: Store<CoreStore, AnyAction>) {
    const state = store.getState()
    const bcToLoad: Record<string, WidgetMeta> = {}
    state.view.widgets.forEach(widget => {
        if (widget.bcName) {
            let bcName = widget.bcName
            let parentName = state.screen.bo.bc[widget.bcName].parentName
            while (parentName) {
                bcName = parentName
                parentName = state.screen.bo.bc[parentName].parentName
            }
            if (!bcToLoad[bcName]) {
                bcToLoad[bcName] = widget
            }
        }
    })
    const result = Object.entries(bcToLoad).map(([bcName, widget]) => {
        // TODO: Row meta request should be scheduled after `bcFetchDataSuccess` here
        // (now it is scheduled in bcFetchDataRequest epic)
        return $do.bcFetchDataRequest({ widgetName: widget.name, bcName })
    })
    return result
}
