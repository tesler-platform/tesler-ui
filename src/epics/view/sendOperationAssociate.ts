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

import { map, filter } from 'rxjs/operators'
import { matchOperationRole } from '../../utils/operations'
import { OperationTypeCrud } from '../../interfaces/operation'
import { Epic, types, $do, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { ofType, StateObservable } from 'redux-observable'

/**
 * Opens a popup with {@link AssocListPopup | associate component}.
 *
 * @param action$ This epic will fire on {@link ActionPayloadTypes.sendOperation | sendOperation} action where
 * sendOperation role is matching {@link OperationTypeCrud.associate}
 * @param store$
 * @returns {@link ActionPayloadTypes.showViewPopup | showViewPopup} for `${bcName}Assoc`
 * @category Epics
 */
export const sendOperationAssociate: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.sendOperation),
        filter(action => matchOperationRole(OperationTypeCrud.associate, action.payload, store$.value)),
        map(action => {
            return sendOperationAssociateImpl(action, store$)
        })
    )

/**
 * Default implementation for `sendOperationAssociate` epic.
 *
 * Opens a popup with {@link AssocListPopup | associate component}.
 *
 * @param action This epic will fire on {@link ActionPayloadTypes.sendOperation | userDrillDown} action
 * @param store$
 * @returns {@link ActionPayloadTypes.showViewPopup | showViewPopup} for `${bcName}Assoc`
 * @category Epics
 */
export function sendOperationAssociateImpl(action: ActionsMap['sendOperation'], store$: StateObservable<CoreStore>) {
    return $do.showViewPopup({
        // TODO: 2.0.0 bcKey and bcName will be removed in favor `widgetName`
        bcName: action.payload.bcKey ? `${action.payload.bcKey}` : `${action.payload.bcName}Assoc`,
        calleeBCName: action.payload.bcName,
        active: true,
        calleeWidgetName: action.payload.widgetName
    })
}
