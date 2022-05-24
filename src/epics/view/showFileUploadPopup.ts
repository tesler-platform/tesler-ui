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

import { of as observableOf, concat as observableConcat, Observable } from 'rxjs'
import { mergeMap, filter } from 'rxjs/operators'
import { Epic, types, $do, ActionsMap, AnyAction } from '../../actions/actions'
import { matchOperationRole } from '../../utils/operations'
import { OperationTypeCrud } from '../../interfaces/operation'
import { ofType } from 'redux-observable'

/**
 * Fires `bcChangeCursors` and `showFileUploadPopup` to drop the cursors and show file upload popup.
 *
 * @param action$ sendOperation
 * @param store$
 */
export const showFileUploadPopup: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.sendOperation),
        filter(action => matchOperationRole(OperationTypeCrud.fileUpload, action.payload, store$.value)),
        mergeMap(action => {
            return showFileUploadPopupImpl(action)
        })
    )

/**
 * Default implementation for `showFileUploadPopupImpl` epic
 *
 * Fires `bcChangeCursors` and `showFileUploadPopup` to drop the cursors and show file upload popup.
 *
 * @param action sendOperation
 * @category Epics
 */
export function showFileUploadPopupImpl(action: ActionsMap['sendOperation']): Observable<AnyAction> {
    return observableConcat(
        observableOf($do.bcChangeCursors({ cursorsMap: { [action.payload.bcName]: null } })),
        observableOf($do.showFileUploadPopup({ widgetName: action.payload.widgetName }))
    )
}
