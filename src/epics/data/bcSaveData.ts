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

import { ActionsMap, $do, AnyAction, types, Epic } from '../../actions/actions'
import { Store } from 'redux'
import { Store as CoreStore } from '../../interfaces/store'
import { OperationTypeCrud, OperationErrorEntity, OperationError } from '../../interfaces/operation'
import { matchOperationRole } from '../../utils/operations'
import { buildBcUrl } from '../../utils/strings'
import { getBcChildren } from '../../utils/bc'
import { Observable } from 'rxjs'
import { AxiosError } from 'axios'
import i18n from 'i18next'
import { saveBcData } from '../../api/api'

/**
 * Post record's pending changes to `save data` API endpoint.
 * Pending changes for fields disabled through row meta are not send; pleace notice that fields are
 * disabled by default.
 *
 * On success following actions are dispatched:
 * - {@link ActionPayloadTypes.bcSaveDataSuccess | bcSaveDataSuccess}
 * - {@link ActionPayloadTypes.bcFetchRowMeta | bcFetchRowMeta}
 * - one {@link ActionPayloadTypes.bcFetchDataRequest | bcFetchDataRequest } for each children of saved
 * business component
 * - optional {@link ActionPayloadTypes.processPostInvoke | processPostInvoke } if present in response
 * - optional `onSuccessAction` callback if provided in payload.
 *
 * On failure, console.error called and {@link ActionPayloadTypes.bcSaveDataFail | bcSaveDataFail} action
 * dispatched.
 *
 * If there was a `onSuccessAction` callback provided in action payload (and widget option
 * {@link WidgetOptions.disableNotification | disableNotification } was not set)
 * then a notification will be shown on failure with suggestion to cancel pending changes and a button that fires
 * {@link ActionPayloadTypes.bcCancelPendingChanges | bcCancelPendingChanges}
 *
 * @param action {@link ActionPayloadTypes.sendOperation | sendOperation} with `save` role
 * @param store Store instance
 * @category Epics
 */
export const bcSaveDataEpic: Epic = (action$, store) =>
    action$
        .ofType(types.sendOperation)
        .filter(action => matchOperationRole(OperationTypeCrud.save, action.payload, store.getState()))
        .mergeMap(action => {
            return bcSaveDataImpl(action, store)
        })

/**
 * Default implementation for `bcSaveData` epic
 *
 * Post record's pending changes to `save data` API endpoint.
 * Pending changes for fields disabled through row meta are not send; pleace notice that fields are
 * disabled by default.
 *
 * On success following actions are dispatched:
 * - {@link ActionPayloadTypes.bcSaveDataSuccess | bcSaveDataSuccess}
 * - {@link ActionPayloadTypes.bcFetchRowMeta | bcFetchRowMeta}
 * - one {@link ActionPayloadTypes.bcFetchDataRequest | bcFetchDataRequest } for each children of saved
 * business component
 * - optional {@link ActionPayloadTypes.processPostInvoke | processPostInvoke } if present in response
 * - optional `onSuccessAction` callback if provided in payload.
 *
 * On failure, console.error called and {@link ActionPayloadTypes.bcSaveDataFail | bcSaveDataFail} action
 * dispatched.
 *
 * If there was a `onSuccessAction` callback provided in action payload (and widget option
 * {@link WidgetOptions.disableNotification | disableNotification } was not set)
 * then a notification will be shown on failure with suggestion to cancel pending changes and a button that fires
 * {@link ActionPayloadTypes.bcCancelPendingChanges | bcCancelPendingChanges}
 *
 * @param action {@link ActionPayloadTypes.sendOperation | sendOperation} with `save` role
 * @param store Store instance
 * @category Epics
 */
export function bcSaveDataImpl(action: ActionsMap['sendOperation'], store: Store<CoreStore, AnyAction>) {
    const state = store.getState()
    const bcName = action.payload.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const widgetName = action.payload.widgetName
    const cursor = state.screen.bo.bc[bcName].cursor
    const dataItem = state.data[bcName].find(item => item.id === cursor)
    const pendingChanges = state.view.pendingDataChanges[bcName]?.[cursor]
    const rowMeta = bcUrl && state.view.rowMeta[bcName]?.[bcUrl]
    const options = state.view.widgets.find(widget => widget.name === widgetName)?.options

    // there is no row meta when parent bc custom operation's postaction triggers autosave, because custom operation call bcForceUpdate
    if (rowMeta) {
        const fields = rowMeta.fields
        for (const key in pendingChanges) {
            if (fields.find(item => item.key === key && item.disabled)) {
                delete pendingChanges[key]
            }
        }
    }

    const fetchChildrenBcData = Object.entries(getBcChildren(bcName, state.view.widgets, state.screen.bo.bc)).map(entry => {
        const [childBcName, widgetNames] = entry
        return $do.bcFetchDataRequest({ bcName: childBcName, widgetName: widgetNames[0] })
    })

    const context = { widgetName: action.payload.widgetName }
    return saveBcData(state.screen.screenName, bcUrl, { ...pendingChanges, vstamp: dataItem.vstamp }, context)
        .mergeMap(data => {
            const postInvoke = data.postActions[0]
            const responseDataItem = data.record
            return Observable.concat(
                Observable.of($do.bcSaveDataSuccess({ bcName, cursor, dataItem: responseDataItem })),
                Observable.of($do.bcFetchRowMeta({ widgetName, bcName })),
                Observable.of(...fetchChildrenBcData),
                postInvoke
                    ? Observable.of(
                          $do.processPostInvoke({
                              bcName,
                              widgetName,
                              postInvoke,
                              cursor: responseDataItem.id
                          })
                      )
                    : Observable.empty<never>(),
                action.payload.onSuccessAction ? Observable.of(action.payload.onSuccessAction) : Observable.empty<never>()
            )
        })
        .catch((e: AxiosError) => {
            console.error(e)
            // Protection against widget blocking while autosaving
            if (action.payload.onSuccessAction && !options?.disableNotification) {
                store.dispatch(
                    $do.addNotification({
                        key: 'data_autosave_undo',
                        type: 'buttonWarningNotification',
                        message: i18n.t('There are pending changes. Please save them or cancel.'),
                        duration: 0,
                        options: {
                            buttonWarningNotificationOptions: {
                                buttonText: i18n.t('Cancel changes'),
                                actionsForClick: [$do.bcCancelPendingChanges({ bcNames: [bcName] })]
                            }
                        }
                    })
                )
            }
            let viewError: string = null
            let entityError: OperationErrorEntity = null
            const operationError = e.response?.data as OperationError
            if (e.response?.data === Object(e.response?.data)) {
                entityError = operationError?.error?.entity
                viewError = operationError?.error?.popup?.[0]
            }
            return Observable.of($do.bcSaveDataFail({ bcName, bcUrl, viewError, entityError }))
        })
}
