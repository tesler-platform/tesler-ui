/**
 * Handles validation of "required fields" for widget operations
 */

import {AnyAction, Dispatch, Middleware, MiddlewareAPI} from 'redux'
import {$do, types, ActionPayloadTypes} from '../actions/actions'
import {Operation, OperationGroup} from '../interfaces/operation'
import {Store as CoreStore} from '../interfaces/store'
import {buildBcUrl} from '../utils/strings'
import {openButtonWarningNotification} from '../utils/notifications'
import i18n from 'i18next'
import {PendingDataItem, DataItem} from '../interfaces/data'
import {RowMetaField} from '../interfaces/rowMeta'
import {WidgetField, WidgetFieldBlock, isWidgetFieldBlock, TableLikeWidgetTypes} from '../interfaces/widget'
import {flattenOperations} from '../utils/operations'

const requiredFields = ({ getState, dispatch }: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>) => (next: Dispatch) =>
(action: AnyAction) => {
    const state = getState()
    if (action.type === types.sendOperation) {
        const { bcName, operationType, widgetName } = action.payload as unknown as ActionPayloadTypes['sendOperation']
        const cursor = state.screen.bo.bc[bcName]?.cursor
        const bcUrl = buildBcUrl(bcName, true)
        const record = state.data[bcName]?.find(item => item.id === cursor)
        const rowMeta = bcUrl && state.view.rowMeta[bcName]?.[bcUrl]
        const pendingValues = state.view.pendingDataChanges[bcName]?.[cursor]
        const widget = state.view.widgets.find(item => item.name === widgetName)
        // If operation marked as validation-sensetive, mark all 'required' fields which haven't been filled as dirty and invalid
        if (operationRequiresAutosave(operationType, rowMeta?.actions)) {
            // While `required` fields are assigned via rowMeta, only visually visible fields should be checked
            // to avoid situations when field is marked as `required` but not available for user to interact.
            const fieldsToCheck: Record<string, RowMetaField> = {}
            // Form could be split into multiple widgets so we check all widget with the same BC as action initiator.
            // TODO: use visibleSameBcWidgets instead of state.view.widgets (i.e. widgets showCondition should be respected)
            state.view.widgets
            .filter(item => item.bcName === widget.bcName)
            .forEach(item => {
                const itemFieldsCalc: object[] = item.fields
                if (item.fields) {
                    item.fields.forEach((block: object | WidgetFieldBlock<object>) => {
                        if (isWidgetFieldBlock(block)) {
                            block.fields.forEach((field: []) => itemFieldsCalc.push(field))
                        }
                    })
                }
                itemFieldsCalc.forEach((widgetField: WidgetField) => {
                    const matchingRowMeta = rowMeta.fields.find(rowMetaField => rowMetaField.key === widgetField.key)
                    if (!fieldsToCheck[widgetField.key] && matchingRowMeta && !matchingRowMeta.hidden) {
                        fieldsToCheck[widgetField.key] = matchingRowMeta
                    }
                })
            })
            const dataItem: PendingDataItem = getRequiredFieldsMissing(record, pendingValues, Object.values(fieldsToCheck))
            // For tables, try to autofocus on first missing field
            if (dataItem && TableLikeWidgetTypes.includes(widget?.type)) {
                dispatch($do.selectTableCellInit({ widgetName, rowId: cursor, fieldKey: Object.keys(dataItem)[0] }))
            }
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
function operationRequiresAutosave(operationType: string, actions: Array<Operation | OperationGroup>) {
    let result = false
    if (!actions) {
        console.error('rowMeta is missing in the middle of "sendOperation" action')
        return result
    }
    result = flattenOperations(actions).some(action => action.autoSaveBefore)
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
        const value = record?.[field.key] as string
        const pendingValue = pendingChanges?.[field.key]
        const effectiveValue = pendingValue !== undefined ? pendingValue : value
        let falsyValue = false
        if ([undefined, null, ''].includes(effectiveValue as any)) {
            falsyValue = true
        } else if (Array.isArray(effectiveValue) && !effectiveValue.length) {
            falsyValue = true
        } else if (effectiveValue && typeof effectiveValue === 'object' && !Object.keys(effectiveValue).length) {
            falsyValue = true
        }
        if (field.required && falsyValue) {
            result[field.key] = null
        }
    })
    return Object.keys(result).length > 0 ? result : null
}

/**
 * TODO
 */
export function createRequiredFieldsMiddleware() {
    return requiredFields as Middleware
}
