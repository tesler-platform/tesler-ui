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

import {Operation, isOperationGroup, OperationGroup, OperationTypeCrud, crudOperations} from '../interfaces/operation'
import {buildBcUrl} from './strings'
import {Store} from '../interfaces/store'
import {ActionPayloadTypes} from '../actions/actions'

/**
 * Extract operations from all operations groups and return them as an array of flat operations
 *
 * @param operations Operations or operation groups as received from row meta
 */
export function flattenOperations(operations: Array<Operation | OperationGroup>) {
    const result: Operation[] = []
    operations?.forEach(item => {
        if (isOperationGroup(item)) {
            const currentOperation = item
            currentOperation.actions.forEach(OperationItem => {
                result.push(OperationItem)
            })
        } else {
            result.push(item)
        }
    })
    return result
}

/**
 * Check if an operation matches a specified `role` directly by type or by `actionRole` field.
 * 
 * If operation role is unavailable due to the store lacking an appropriate row meta, only `role` is checked.
 *  
 * @param role Expected operation role or 'none' if operation shouldn't match any crud role
 * @param payload sendOperation action payload
 * @param store Store instance
 */
export function matchOperationRole(role: OperationTypeCrud | 'none', payload: ActionPayloadTypes['sendOperation'], store: Store) {
    if (payload.operationType === role) {
        return true
    }
    const bcUrl = buildBcUrl(payload.bcName, true, store)
    const operations = flattenOperations(store.view.rowMeta[payload.bcName]?.[bcUrl]?.actions)
    const operation = operations.find(item => item.type === payload.operationType)
    if (role === 'none') {
        return crudOperations.every(item => item !== payload.operationType && item !== operation?.actionRole)
    }
    return operation?.actionRole === role
}
