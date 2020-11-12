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

import {Observable} from 'rxjs'
import {Store} from 'redux'
import {Epic, types, AnyAction, ActionsMap, $do} from '../../actions/actions'
import {Store as CoreStore} from '../../interfaces/store'
import {ApplicationErrorType, BusinessError} from '../../interfaces/view'
import { OperationError } from '../../interfaces/operation'

export const httpError418: Epic = (action$, store) => action$.ofType(types.httpError)
.filter(action => action.payload.statusCode === 418)
.mergeMap((action) => {
    return httpError418Impl(action, store)
})

export function httpError418Impl(
    action: ActionsMap['httpError'],
    store: Store<CoreStore, AnyAction>
): Observable<AnyAction> {
    const { error, callContext } = action.payload
    const result: Array<Observable<AnyAction>> = []
    const typedError = error.response.data as OperationError
    if (!typedError.error.popup) {
        return Observable.empty()
    }
    const businessError: BusinessError = {
        type: ApplicationErrorType.BusinessError,
        message: typedError.error.popup[0]
    }
    result.push(Observable.of($do.showViewError({ error: businessError })))
    if (typedError.error.postActions?.[0]) {
        const widget = store.getState().view.widgets.find(item => item.name === callContext.widgetName)
        const bcName = widget.bcName
        result.push(Observable.of($do.processPostInvoke({
            bcName,
            postInvoke: typedError.error.postActions[0],
            widgetName: widget.name
        })))
    }
    return Observable.concat(...result)
}
