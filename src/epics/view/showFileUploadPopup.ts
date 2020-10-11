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

import {Epic, types, $do, ActionsMap} from '../../actions/actions'
import {Observable} from 'rxjs'
import {matchOperationRole} from '../../utils/operations'
import {OperationTypeCrud} from '../../interfaces/operation'

/**
 * Fires `bcChangeCursors` and `showFileUploadPopup` to drop the cursors and show file upload popup.
 *
 * @param action sendOperation
 * @param store Store instance
 */
export const showFileUploadPopup: Epic = (action$, store) => action$.ofType(types.sendOperation)
.filter(action => matchOperationRole(OperationTypeCrud.fileUpload, action.payload, store.getState()))
.mergeMap((action) => {
    return showFileUploadPopupImpl(action)
})

/**
 * Default implementation for `showFileUploadPopupImpl` epic
 *
 * Fires `bcChangeCursors` and `showFileUploadPopup` to drop the cursors and show file upload popup.
 *
 * @param action sendOperation
 * @param store Store instance
 */
export function showFileUploadPopupImpl(action: ActionsMap['sendOperation']) {
    return Observable.concat(
        Observable.of($do.bcChangeCursors({ cursorsMap: { [action.payload.bcName]: null }})),
        Observable.of($do.showFileUploadPopup({ widgetName: action.payload.widgetName }))
    )
}
