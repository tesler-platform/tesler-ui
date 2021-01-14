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

import { Observable } from 'rxjs'
import { Store } from 'redux'
import { Epic, types, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { notification } from 'antd'
import i18n from 'i18next'

/**
 * Throws a error popup when attempting to navigate to a screen which is missing for current session
 *
 * @param action$ selectViewFail
 */
export const selectScreenFail: Epic = (action$, store) =>
    action$.ofType(types.selectScreenFail).mergeMap(action => {
        return selectScreenFailImpl(action, store)
    })

/**
 *
 * @param action
 * @param store
 * @category Epics
 */
export function selectScreenFailImpl(action: ActionsMap['selectScreenFail'], store: Store<CoreStore, AnyAction>): Observable<AnyAction> {
    notification.error({
        message: i18n.t('Screen is missing or unavailable for your role', { screenName: action.payload.screenName }),
        duration: 15
    })
    return Observable.empty()
}
