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

import { $do, Epic, types } from '../../actions/actions'
import { Observable } from 'rxjs/Observable'

/**
 * Dispatches `changeDataItem` action and closes pop up when it's ready
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const changePopupValueAndClose: Epic = (action$, store) =>
    action$.ofType(types.changePopupValueAndClose).mergeMap(action => {
        const { bcName } = action.payload

        const closePopup = Observable.concat(
            Observable.of($do.viewClearPickMap(null)),
            Observable.of($do.closeViewPopup(null)),
            Observable.of($do.bcRemoveAllFilters({ bcName }))
        )

        return Observable.concat(
            Observable.of($do.changeDataItem(action.payload)),
            action$
                .ofType(types.popupCloseReady)
                .filter(a => a.payload.bcName === bcName)
                .take(1)
                .switchMap(() => closePopup)
        )
    })
