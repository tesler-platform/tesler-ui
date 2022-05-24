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

import { concat as observableConcat, of as observableOf, Observable, EMPTY } from 'rxjs'
import { mergeMap, filter } from 'rxjs/operators'
import { Epic, types, AnyAction, ActionsMap, $do } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { ApplicationErrorType, BusinessError } from '../../interfaces/view'
import { OperationError } from '../../interfaces/operation'
import { ofType, StateObservable } from 'redux-observable'

export const httpError418: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.httpError),
        filter(action => action.payload.statusCode === 418),
        mergeMap(action => {
            return httpError418Impl(action, store$)
        })
    )

/**
 *
 * @param action
 * @param store$
 * @category Epics
 */
export function httpError418Impl(action: ActionsMap['httpError'], store$: StateObservable<CoreStore>): Observable<AnyAction> {
    const { error, callContext } = action.payload
    const result: Array<Observable<AnyAction>> = []
    const typedError = error.response.data as OperationError
    if (!typedError.error.popup) {
        return EMPTY
    }
    const businessError: BusinessError = {
        type: ApplicationErrorType.BusinessError,
        message: typedError.error.popup[0]
    }
    result.push(observableOf($do.showViewError({ error: businessError })))
    if (typedError.error.postActions?.[0]) {
        const widget = store$.value.view.widgets.find(item => item.name === callContext.widgetName)
        const bcName = widget.bcName
        result.push(
            observableOf(
                $do.processPostInvoke({
                    bcName,
                    postInvoke: typedError.error.postActions[0],
                    widgetName: widget.name
                })
            )
        )
    }
    return observableConcat(...result)
}
