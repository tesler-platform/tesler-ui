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
import { mergeMap } from 'rxjs/operators'
import { Epic, types, $do, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { buildBcUrl } from '../../utils/strings'
import { customAction } from '../../api/api'
import { postOperationRoutine } from '../view'
import { OperationTypeCrud } from '../../interfaces/operation'
import { ofType, StateObservable } from 'redux-observable'

/**
 * It sends customAction request for `file-upload-save` endpoint with `bulkIds` data
 * containing ids of uploaded files.
 * On success it fires `sendOperationSuccess`, `bcForceUpdate` and `closeViewPopup` actions
 * to refresh business component and close popup.
 *
 * It also launces postOperationRoutine to handle pre and post invokes.
 *
 * @param action$ removeMultivalueTag
 * @param store$
 */
export const fileUploadConfirm: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.bulkUploadFiles),
        mergeMap(action => {
            return fileUploadConfirmImpl(action, store$)
        })
    )

/**
 * Default implementation for `fileUploadConfirm` epic
 *
 * It sends customAction request for `file-upload-save` endpoint with `bulkIds` data
 * containing ids of uploaded files.
 * On success it fires `sendOperationSuccess`, `bcForceUpdate` and `closeViewPopup` actions
 * to refresh business component and close popup.
 *
 * It also launces postOperationRoutine to handle pre and post invokes.
 *
 * @param action removeMultivalueTag
 * @param store$
 * @category Epics
 */
export function fileUploadConfirmImpl(action: ActionsMap['bulkUploadFiles'], store$: StateObservable<CoreStore>): Observable<AnyAction> {
    const state = store$.value
    const bcName = state.view.popupData.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const widgetName = state.view.widgets.find(item => item.bcName === bcName)?.name
    const data = {
        bulkIds: action.payload.fileIds
    }
    return customAction(state.screen.screenName, bcUrl, data, null, { _action: 'file-upload-save' }).pipe(
        mergeMap(response => {
            const postInvoke = response.postActions[0]
            const preInvoke = response.preInvoke
            return observableConcat(
                observableOf($do.sendOperationSuccess({ bcName, cursor: null })),
                observableOf($do.bcForceUpdate({ bcName })),
                observableOf($do.closeViewPopup(null)),
                ...postOperationRoutine(widgetName, postInvoke, preInvoke, OperationTypeCrud.save, bcName)
            )
        })
    )
}
