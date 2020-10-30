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

/**
 * Process preInvoke operation before action sendOperation
 */

import {AnyAction, Dispatch, Middleware, MiddlewareAPI} from 'redux'
import {$do, types} from '../actions/actions'
import {Store as CoreStore} from '../interfaces/store'
import {buildBcUrl} from '../utils/strings'
import {flattenOperations} from '../utils/operations'

const preInvokeAction = ({getState, dispatch}: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>) => (next: Dispatch) =>
    (action: AnyAction) => {
        if (action.type === types.sendOperation) {
            const state = getState()
            const { operationType, widgetName, confirm } = action.payload
            const bcName = state.view.widgets.find(widgetItem => widgetItem.name === widgetName)?.bcName
            const bcUrl = buildBcUrl(bcName, true)
            const rowMeta = bcUrl && state.view.rowMeta[bcName]?.[bcUrl]
            const actions = rowMeta && flattenOperations(rowMeta.actions)
            const preInvoke = actions?.find(item => item.type === operationType)?.preInvoke
            return preInvoke && !confirm
                ? next($do.processPreInvoke({
                    bcName,
                    operationType,
                    widgetName,
                    preInvoke,
                }))
                : next(action)
        }
        return next(action)
    }

/**
 * TODO
 */
export function createPreInvokeMiddleware() {
    return preInvokeAction as Middleware
}
