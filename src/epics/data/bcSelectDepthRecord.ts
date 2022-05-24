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

import { of as observableOf, concat as observableConcat, Observable } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { Epic, types, $do, AnyAction, ActionsMap } from '../../actions/actions'
import { ofType } from 'redux-observable'

export const bcSelectDepthRecord: Epic = action$ =>
    action$.pipe(
        ofType(types.bcSelectDepthRecord),
        mergeMap(action => {
            return bcSelectDepthRecordImpl(action)
        })
    )

/**
 * Set a cursor when expanding a record in hierarchy widgets builded around single business components
 * and fetch the data for children of expanded record.
 *
 * {@link ActionPayloadTypes.bcChangeDepthCursor | bcChangeDepthCursor} action is dispatched to set the cursor
 * for expanded record; only one expanded record is allowed per hierarchy depth level.
 *
 * {@link ActionPayloadTypes.bcFetchDataRequest | bcFetchDataRequest} action is dispatched to fetch children data
 * for expanded record. `ignorePageLimit`` is set as there are no controls for navigating between data pages
 * in nested levels of hierarchy so instead all records are fetched.
 *
 * TODO: There is no apparent reason why `widgetName` is empty; probably will be mandatory and replace `bcName` in 2.0.0.
 *
 * @param action This epic will fire on {@link ActionPayloadTypes.bcSelectDepthRecord | bcSelectDepthRecord} action
 * @deprecated Do not use; TODO: Will be removed in 2.0.0
 * @category Epics
 */
export function bcSelectDepthRecordImpl(action: ActionsMap['bcSelectDepthRecord']): Observable<AnyAction> {
    const { bcName, cursor, depth } = action.payload
    return observableConcat(
        observableOf($do.bcChangeDepthCursor({ bcName, depth, cursor })),
        observableOf(
            $do.bcFetchDataRequest({
                bcName,
                depth: depth + 1,
                widgetName: '',
                ignorePageLimit: true
            })
        )
    )
}
