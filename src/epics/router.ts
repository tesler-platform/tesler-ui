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

import { $do, Epic, types } from '../actions/actions'
import { Observable } from 'rxjs/Observable'
import * as api from '../api/api'
import { buildBcUrl } from '../utils/strings'
import { DrillDownType } from '../interfaces/router'
import { drillDown } from './router/drilldown'
import { WidgetFieldBase } from '../interfaces/widget'
import { selectScreenFail } from './router/selectScreenFail'
import { selectViewFail } from './router/selectViewFail'
import { changeLocation } from './router/changeLocation'
import { changeScreen } from './router/selectScreen'
import { changeView } from './router/selectView'
import { loginDone } from './router/loginDone'
import { handleRouter } from './router/handleRouter'

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const userDrillDown: Epic = (action$, store) =>
    action$
        .ofType(types.userDrillDown)
        .map(action => {
            const state = store.getState()
            const widget = state.view.widgets.find(item => item.name === action.payload.widgetName)
            const cursor = state.screen.bo.bc[widget?.bcName]?.cursor
            if (cursor !== action.payload.cursor) {
                store.dispatch($do.bcChangeCursors({ cursorsMap: { [action.payload.bcName]: action.payload.cursor } }))
            }
            return action
        })
        .switchMap(action => {
            const state = store.getState()
            const { bcName, fieldKey, cursor } = action.payload
            const bcUrl = buildBcUrl(bcName, true)
            const fetch = api.fetchRowMeta(state.screen.screenName, bcUrl)
            return fetch
                .mergeMap(rowMeta => {
                    const drillDownField = rowMeta.fields.find(field => field.key === fieldKey)
                    const route = state.router
                    const drillDownKey = (state.view.widgets
                        .find(widget => widget.bcName === bcName)
                        ?.fields.find((field: WidgetFieldBase) => field.key === fieldKey) as WidgetFieldBase)?.drillDownKey
                    const customDrillDownUrl = state.data?.[bcName]?.find(record => record.id === cursor)?.[drillDownKey] as string
                    return customDrillDownUrl || drillDownField?.drillDown || drillDownField?.drillDown !== route.path
                        ? Observable.concat(
                              drillDownField.drillDownType !== DrillDownType.inner
                                  ? Observable.of($do.bcFetchRowMetaSuccess({ bcName, rowMeta, bcUrl, cursor }))
                                  : Observable.empty<never>(),
                              Observable.of($do.userDrillDownSuccess({ bcName, bcUrl, cursor })),
                              Observable.of(
                                  $do.drillDown({
                                      url: customDrillDownUrl || drillDownField.drillDown,
                                      drillDownType: drillDownField.drillDownType as DrillDownType,
                                      route
                                  })
                              )
                          )
                        : Observable.empty<never>()
                })
                .catch(error => {
                    console.error(error)
                    return Observable.empty() // TODO:
                })
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
