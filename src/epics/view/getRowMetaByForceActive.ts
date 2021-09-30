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

import { $do, AnyAction, Epic, types } from '../../actions/actions'
import { WidgetTypes } from '../../interfaces/widget'
import { Observable } from 'rxjs/Observable'
import { buildBcUrl } from '../../utils/strings'
import { v4 } from 'uuid'
import { AxiosError } from 'axios'
import { OperationError, OperationErrorEntity } from '../../interfaces/operation'
import { delay } from 'rxjs/operators'
import { getRmByForceActive } from '../../api/api'

/**
 * Sends row meta request when `forceActive` field fires `onChange`
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const getRowMetaByForceActive: Epic = (action$, store) =>
    action$.ofType(types.changeDataItem).mergeMap(action => {
        const state = store.getState()
        const initUrl = state.view.url
        const { bcName, cursor, disableRetry } = action.payload

        const isBcHierarchy = state.view.widgets.some(widget => {
            return (
                widget.bcName === bcName &&
                widget.type === WidgetTypes.AssocListPopup &&
                (widget.options?.hierarchySameBc || widget.options?.hierarchyFull)
            )
        })
        if (isBcHierarchy) {
            return Observable.empty<never>()
        }

        const isPickListPopup = state.view.widgets.find(
            item =>
                item.name === state.view.popupData?.widgetName &&
                [WidgetTypes.PickListPopup, WidgetTypes.FlatTreePopup].includes(item.type as WidgetTypes)
        )
        const bcUrl = buildBcUrl(bcName, true)
        const pendingChanges = state.view.pendingDataChanges[bcName][cursor]
        const handledForceActive = state.view.handledForceActive[bcName]?.[cursor] || {}
        const currentRecordData = state.data[bcName]?.find(record => record.id === cursor)
        const fieldsRowMeta = state.view.rowMeta[bcName]?.[bcUrl]?.fields
        let changedFiledKey: string = null

        // find the `forceActive` field which changed  regarding to handled `forceActive` fields or which is absent in delta
        // then set the flag to sent a request
        const someForceActiveChanged = fieldsRowMeta
            ?.filter(field => field.forceActive && pendingChanges[field.key] !== undefined)
            .some(field => {
                const result = pendingChanges[field.key] !== handledForceActive[field.key]
                if (result) {
                    changedFiledKey = field.key
                }
                return result
            })
        const requestId = v4()
        if (someForceActiveChanged && !disableRetry) {
            return Observable.concat(
                Observable.of($do.addPendingRequest({ request: { requestId, type: 'force-active' } })),
                getRmByForceActive(state.screen.screenName, bcUrl, { ...pendingChanges, vstamp: currentRecordData.vstamp })
                    .mergeMap(data => {
                        const result: Array<Observable<AnyAction>> = [Observable.of($do.removePendingRequest({ requestId }))]
                        if (store.getState().view.url === initUrl) {
                            result.push(
                                Observable.of(
                                    $do.forceActiveRmUpdate({
                                        rowMeta: data,
                                        currentRecordData,
                                        bcName,
                                        bcUrl,
                                        cursor
                                    })
                                )
                            )
                        }
                        if (isPickListPopup) {
                            result.push(Observable.of($do.popupCloseReady({ bcName })))
                        }
                        return Observable.concat(...result)
                    })
                    .catch((e: AxiosError) => {
                        console.error(e)
                        let viewError: string = null
                        let entityError: OperationErrorEntity = null
                        const operationError = e.response?.data as OperationError
                        if (e.response?.data === Object(e.response?.data)) {
                            entityError = operationError?.error?.entity
                            viewError = operationError?.error?.popup?.[0]
                        }
                        return Observable.concat(
                            Observable.of($do.removePendingRequest({ requestId })),
                            store.getState().view.url === initUrl
                                ? Observable.concat(
                                      Observable.of(
                                          $do.changeDataItem({
                                              bcName,
                                              cursor,
                                              dataItem: { [changedFiledKey]: currentRecordData[changedFiledKey] },
                                              disableRetry: true
                                          })
                                      ),
                                      Observable.of($do.forceActiveChangeFail({ bcName, bcUrl, viewError, entityError }))
                                  )
                                : Observable.empty<never>()
                        )
                    })
            )
        }

        return isPickListPopup ? Observable.of($do.popupCloseReady({ bcName })).pipe(delay(0)) : Observable.empty<never>()
    })
