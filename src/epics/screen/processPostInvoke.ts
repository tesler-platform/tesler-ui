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

import { of as observableOf, Observable, EMPTY } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { Epic, types, $do, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { historyObj } from '../../reducers/router'
import {
    OperationPostInvokeType,
    OperationPostInvokeDrillDown,
    OperationPostInvokeRefreshBc,
    OperationPostInvokeShowMessage,
    OperationPostInvokeDownloadFile,
    OperationPostInvokeDownloadFileByUrl
} from '../../interfaces/operation'
import { ofType, StateObservable } from 'redux-observable'

export const processPostInvoke: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.processPostInvoke),
        mergeMap(action => {
            return processPostInvokeImpl(action, store$)
        })
    )

/**
 *
 * @param action
 * @param store$
 * @category Epics
 */
export function processPostInvokeImpl(action: ActionsMap['processPostInvoke'], store$: StateObservable<CoreStore>): Observable<AnyAction> {
    const state = store$.value
    switch (action.payload.postInvoke.type) {
        case OperationPostInvokeType.drillDown:
            return observableOf(
                $do.drillDown({
                    ...(action.payload.postInvoke as OperationPostInvokeDrillDown),
                    route: state.router,
                    widgetName: action.payload.widgetName
                })
            )
        case OperationPostInvokeType.postDelete: {
            const cursorsMap: Record<string, string> = { [action.payload.bcName]: null }
            const result: AnyAction[] = [$do.bcChangeCursors({ cursorsMap })]
            if (state.router.bcPath.includes(`${action.payload.bcName}/`)) {
                const newBcUrl = state.router.bcPath.split(action.payload.bcName)[0] || ''
                const newUrl = `/screen/${state.router.screenName}/view/${state.router.viewName}/${newBcUrl}`
                historyObj.push(newUrl)
            } else {
                result.push(
                    $do.bcFetchDataRequest({
                        bcName: action.payload.bcName,
                        widgetName: action.payload.widgetName
                    })
                )
            }
            return observableOf(...result)
        }
        case OperationPostInvokeType.refreshBC: {
            const bo = state.screen.bo
            const postInvoke = action.payload.postInvoke as OperationPostInvokeRefreshBc
            const postInvokeBC = postInvoke.bc
            const postInvokeBCItem = bo.bc[postInvoke.bc]
            const widgetName = action.payload.widgetName
            const infiniteWidgets: string[] = state.view.infiniteWidgets || []
            const infinitePagination = state.view.widgets.some(item => item.bcName === postInvokeBC && infiniteWidgets.includes(item.name))
            return infinitePagination
                ? observableOf(
                      $do.bcFetchDataPages({
                          bcName: postInvokeBCItem.name,
                          widgetName: widgetName,
                          from: 1,
                          to: postInvokeBCItem.page
                      })
                  )
                : observableOf(
                      $do.bcFetchDataRequest({
                          bcName: postInvokeBCItem.name,
                          widgetName
                      })
                  )
        }
        case OperationPostInvokeType.showMessage: {
            const postInvoke = action.payload.postInvoke as OperationPostInvokeShowMessage
            return observableOf($do.showNotification({ type: postInvoke.messageType, message: postInvoke.messageText }))
        }
        case OperationPostInvokeType.downloadFile: {
            const postInvoke = action.payload.postInvoke as OperationPostInvokeDownloadFile
            return observableOf($do.downloadFile({ fileId: postInvoke.fileId }))
        }
        case OperationPostInvokeType.downloadFileByUrl: {
            const postInvoke = action.payload.postInvoke as OperationPostInvokeDownloadFileByUrl
            return observableOf($do.downloadFileByUrl({ url: postInvoke.url }))
        }
        default:
            // Other types can be handled by client application
            return EMPTY
    }
}
