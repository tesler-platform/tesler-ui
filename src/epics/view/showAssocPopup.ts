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

import { Observable } from 'rxjs'
import { Store } from 'redux'
import { Epic, types, $do, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { MultivalueSingleValue, PendingDataItem } from '../../interfaces/data'
import { WidgetTypes } from '../../interfaces/widget'

export const showAssocPopup: Epic = (action$, store) =>
    action$
        .ofType(types.showViewPopup)
        .filter(action => !!(action.payload.calleeBCName && action.payload.associateFieldKey))
        .mergeMap(action => {
            return showAssocPopupEpicImpl(action, store)
        })

export function showAssocPopupEpicImpl(action: ActionsMap['showViewPopup'], store: Store<CoreStore, AnyAction>) {
    const { bcName, calleeBCName } = action.payload

    const state = store.getState()

    const assocWidget = state.view.widgets.find(widget => widget.bcName === bcName && widget.type === WidgetTypes.AssocListPopup)
    const calleeCursor = state.screen.bo.bc[calleeBCName]?.cursor
    const calleePendingChanges = state.view.pendingDataChanges[calleeBCName]?.[calleeCursor]
    const assocFieldKey = action.payload.associateFieldKey
    const assocFieldChanges = calleePendingChanges?.[assocFieldKey] as MultivalueSingleValue[]
    const somethingMissing = !assocWidget || !calleePendingChanges || !assocFieldChanges || !assocFieldChanges
    if (somethingMissing || (assocWidget.options && !assocWidget.options.hierarchyFull)) {
        return Observable.empty<never>()
    }

    const popupInitPendingChanges: Record<string, PendingDataItem> = {}

    assocFieldChanges.forEach(record => {
        popupInitPendingChanges[record.id] = {
            id: record.id,
            _associate: true,
            _value: record.value
        }
    })

    const calleeData = state.data[calleeBCName]?.find(dataRecord => dataRecord.id === calleeCursor)
    const assocIds = (calleeData?.[assocFieldKey] as MultivalueSingleValue[])?.map(recordId => recordId.id)
    const assocPendingIds = assocFieldChanges.map(recordId => recordId.id)
    if (assocIds) {
        assocIds.forEach(recordId => {
            if (!assocPendingIds.includes(recordId)) {
                popupInitPendingChanges[recordId] = {
                    id: recordId,
                    _associate: false
                }
            }
        })
    }

    return Observable.of(
        $do.changeDataItems({
            bcName,
            cursors: Object.keys(popupInitPendingChanges),
            dataItems: Object.values(popupInitPendingChanges)
        })
    )
}
