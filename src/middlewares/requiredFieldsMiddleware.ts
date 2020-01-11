/**
 * Handles validation of "required fields" for widget operations
 */

import {AnyAction, Dispatch, Middleware, MiddlewareAPI} from 'redux'
import {$do, types, ActionPayloadTypes} from '../actions/actions'
import {isOperationGroup, Operation, OperationGroup} from '../interfaces/operation'
import {Store as CoreStore} from '../interfaces/store'
import {buildBcUrl} from '../utils/strings'
import {openButtonWarningNotification} from '../utils/notifications'
import i18n from 'i18next'
import {PendingDataItem, DataItem} from '../interfaces/data'
import {RowMetaField} from '../interfaces/rowMeta'
import {WidgetField} from '../interfaces/widget'

const requiredFields = ({ getState, dispatch }: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>) => (next: Dispatch) =>
(action: AnyAction) => {
    const state = getState()
    if (action.type === types.sendOperation) {
        const { bcName, operationType, widgetName } = action.payload as unknown as ActionPayloadTypes['sendOperation']
        const cursor = state.screen.bo.bc[bcName] && state.screen.bo.bc[bcName].cursor
        const bcUrl = buildBcUrl(bcName, true)
        const record = state.data[bcName] && state.data[bcName].find(item => item.id === cursor)
        const rowMeta = bcUrl
            && state.view.rowMeta[bcName]
            && state.view.rowMeta[bcName][bcUrl]
        const pendingValues = state.view.pendingDataChanges[bcName]
            && state.view.pendingDataChanges[bcName][cursor]

        // If operation marked as validation-sensetive, mark all 'required' fields which haven't been filled as dirty and invalid
        if (operationRequiresAutosave(operationType, rowMeta && rowMeta.actions)) {
            const widget = state.view.widgets.find(item => item.name === widgetName)
            // While `required` fields are assigned via rowMeta, only visually visible fields should be checked
            // to avoid situations when field is marked as `required` but not available for user to interact.
            const fieldsToCheck: Record<string, RowMetaField> = {}
            // Form could be split into multiple widgets so we check all widget with the same BC as action initiator.
            // TODO: use visibleSameBcWidgets instead of state.view.widgets (i.e. widgets showCondition should be respected)
            state.view.widgets
            .filter(item => item.bcName === widget.bcName)
            .forEach(item => {
                item.fields.forEach((widgetField: WidgetField) => {
                    const matchingRowMeta = rowMeta.fields.find(rowMetaField => rowMetaField.key === widgetField.key)
                    if (!fieldsToCheck[widgetField.key] && matchingRowMeta && !matchingRowMeta.hidden) {
                        fieldsToCheck[widgetField.key] = matchingRowMeta
                    }
                })
            })
            const dataItem: PendingDataItem = getRequiredFieldsMissing(record, pendingValues, Object.values(fieldsToCheck))
            return dataItem
                ? next($do.changeDataItem({ bcName, cursor, dataItem }))
                : next(action)
        }

        // If operation is not validation-sensetive and validation failed, offer to drop pending changes
        if (state.view.pendingValidationFails && Object.keys(state.view.pendingValidationFails).length) {
            openButtonWarningNotification(
                i18n.t('Required fields are missing'),
                i18n.t('Cancel changes'),
                0,
                () => {
                    next(($do.bcCancelPendingChanges(null)))
                    next(($do.clearValidationFails(null)))
                },
                'requiredFieldsMissing'
            )
            return { type: types.emptyAction }
        }
    }

    return next(action)
}

/**
 * Check operations and operation groups for 'autoSaveBefore' flag (i.e. operation is validation-sensetive)
 *
 * @param operationType Key of operation to check
 * @param actions List of operations and/or operation groups
 */
function operationRequiresAutosave(operationType: string, actions: (Operation | OperationGroup)[], ) {
    let result = false
    if (!actions) {
        console.error('rowMeta is missing in the middle of "sendOperation" action')
        return result
    }
    result = actions && actions.some(action => {
        if (isOperationGroup(action)) {
            return action.actions.find(item => item.type === operationType && item.autoSaveBefore)
        } else {
            return action.type === operationType && action.autoSaveBefore
        }
    })
    return result
}

/**
 * Check if required records fields have a falsy value.
 * "Falsy" stands for "undefined", "null", "", [] and {}.
 *
 * @param record Record to check
 * @param pendingChanges Pending record changes which could override record values
 * @param rowMeta Fields meta to check for 'required' flag
 */
function getRequiredFieldsMissing(record: DataItem, pendingChanges: PendingDataItem, fieldsMeta: RowMetaField[]) {
    const result: PendingDataItem = {}
    fieldsMeta.forEach(field => {

        const value = record && record[field.key] as string
        const pendingValue = pendingChanges && pendingChanges[field.key]
        const effectiveValue = pendingValue !== undefined ? pendingValue as string: value
        let falsyValue = false
        if ([undefined, null, ''].includes(effectiveValue)) {
            falsyValue = true
        } else if (Array.isArray(effectiveValue) && !effectiveValue.length) {
            falsyValue = true
        } else if (effectiveValue && !Object.keys(effectiveValue).length) {
            falsyValue = true
        }
        if (field.required && falsyValue) {
            result[field.key] = null
        }
    })
    return Object.keys(result).length > 0 ? result : null
}

export function createRequiredFieldsMiddleware() {
    return requiredFields as Middleware
}
