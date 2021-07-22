import { AnyAction, types } from '../actions/actions'
import { PendingValidationFails, PendingValidationFailsFormat, ViewState } from '../interfaces/view'
import { PendingDataItem } from '../interfaces/data'
import { Store } from '../interfaces/store'
import { OperationTypeCrud } from '../interfaces/operation'
import { buildBcUrl } from '../utils/strings'
import i18n from 'i18next'

export const initialState: ViewState = {
    id: null,
    name: null,
    url: null,
    widgets: [],
    columns: null,
    readOnly: false,
    rowHeight: null,
    rowMeta: {},
    metaInProgress: {},
    popupData: { bcName: null },
    pendingDataChanges: {},
    infiniteWidgets: [],
    pendingValidationFailsFormat: PendingValidationFailsFormat.old,
    pendingValidationFails: {},
    handledForceActive: {},
    selectedCell: null,
    ignoreHistory: null,
    systemNotifications: [],
    error: null,
    modalInvoke: null
}

/**
 * View reducer
 *
 * Stores information about currently active view and various fast-living pending values which should be stored
 * until we navitage to a different view.
 *
 * @param state View branch of Redux store
 * @param action Redux action
 * @param store Store instance for read-only access of different branches of Redux store
 */
export function view(state = initialState, action: AnyAction, store: Store): ViewState {
    switch (action.type) {
        case types.selectView: {
            return {
                ...state,
                rowMeta: initialState.rowMeta,
                ...action.payload
            }
        }
        case types.bcFetchRowMeta: {
            return {
                ...state,
                metaInProgress: {
                    ...state.metaInProgress,
                    [action.payload.bcName]: true
                }
            }
        }
        case types.bcLoadMore: {
            const infiniteWidgets: string[] = state.infiniteWidgets || []
            infiniteWidgets.push(action.payload.widgetName)
            return {
                ...state,
                infiniteWidgets: Array.from(new Set(infiniteWidgets))
            }
        }
        case types.sendOperation: {
            if (action.payload.operationType === OperationTypeCrud.create) {
                return {
                    ...state,
                    metaInProgress: {
                        ...state.metaInProgress,
                        [action.payload.bcName]: true
                    }
                }
            } else {
                return state
            }
        }
        case types.bcFetchRowMetaSuccess: {
            const bcName = action.payload.bcName
            return {
                ...state,
                rowMeta: {
                    ...state.rowMeta,
                    [bcName]: {
                        ...(state.rowMeta[bcName] || {}),
                        [action.payload.bcUrl]: action.payload.rowMeta
                    }
                },
                metaInProgress: {
                    ...state.metaInProgress,
                    [action.payload.bcName]: false
                }
            }
        }
        case types.bcNewDataSuccess: {
            return {
                ...state,
                selectedCell: initialState.selectedCell
            }
        }
        case types.bcNewDataFail:
        case types.bcFetchRowMetaFail: {
            return {
                ...state,
                metaInProgress: {
                    ...state.metaInProgress,
                    [action.payload.bcName]: false
                }
            }
        }
        case types.forceActiveChangeFail:
        case types.bcSaveDataFail:
        case types.sendOperationFail: {
            const bcName = action.payload.bcName
            const errors: Record<string, string> = {}
            if (action.payload.entityError) {
                Object.entries(action.payload.entityError.fields).forEach(([fieldName, violation]) => {
                    errors[fieldName] = violation
                })
            }
            return {
                ...state,
                rowMeta: {
                    ...state.rowMeta,
                    [bcName]: {
                        ...(state.rowMeta[bcName] || {}),
                        [action.payload.bcUrl]: {
                            ...state.rowMeta[bcName][action.payload.bcUrl],
                            errors
                        }
                    }
                }
            }
        }
        case types.forceActiveRmUpdate: {
            const { bcName, bcUrl, currentRecordData, rowMeta, cursor } = action.payload
            const handledForceActive: PendingDataItem = {}
            const rowMetaForcedValues: PendingDataItem = {}
            const newPendingChangesDiff: PendingDataItem = {}
            const forceActiveFieldKeys: string[] = []

            // приведем значения переданные в forcedValue в вид дельты изменений
            rowMeta.fields.forEach(field => {
                rowMetaForcedValues[field.key] = field.currentValue
                if (field.forceActive) {
                    forceActiveFieldKeys.push(field.key)
                }
            })

            const consolidatedFrontData: PendingDataItem = { ...currentRecordData, ...state.pendingDataChanges[bcName][cursor] }
            // вычислим "разницу" между консолид.данными и полученными forcedValue's в пользу последних
            Object.keys(consolidatedFrontData).forEach(key => {
                if (rowMetaForcedValues[key] !== undefined && consolidatedFrontData[key] !== rowMetaForcedValues[key]) {
                    newPendingChangesDiff[key] = rowMetaForcedValues[key]
                }
            })

            // консолидация полученной разницы с актуальной дельтой
            const newPendingDataChanges = { ...state.pendingDataChanges[bcName][cursor], ...newPendingChangesDiff }

            // отразим в списке обработанных forceActive полей - те что содержатся в новой дельте
            forceActiveFieldKeys.forEach(key => {
                if (newPendingDataChanges[key] !== undefined) {
                    handledForceActive[key] = newPendingDataChanges[key]
                }
            })

            return {
                ...state,
                handledForceActive: {
                    ...state.handledForceActive,
                    [bcName]: {
                        ...(state.handledForceActive[bcName] || {}),
                        [cursor]: {
                            ...(state.handledForceActive[bcName]?.[cursor] || {}),
                            ...handledForceActive
                        }
                    }
                },
                pendingDataChanges: {
                    ...state.pendingDataChanges,
                    [bcName]: {
                        ...(state.pendingDataChanges[bcName] || {}),
                        [cursor]: newPendingDataChanges
                    }
                },
                rowMeta: {
                    ...state.rowMeta,
                    [bcName]: {
                        ...(state.rowMeta[bcName] || {}),
                        [bcUrl]: rowMeta
                    }
                }
            }
        }
        case types.changeDataItem: {
            const actionBcName = action.payload.bcName
            const prevBc = state.pendingDataChanges[action.payload.bcName] || {}
            const prevCursor = prevBc[action.payload.cursor] || {}
            const prevPending = prevCursor || {}
            const nextPending = { ...prevPending, ...action.payload.dataItem }
            const bcUrl = buildBcUrl(actionBcName, true, store)
            const rowMeta = state.rowMeta[actionBcName]?.[bcUrl]
            const nextValidationFails: Record<string, string> = {}
            const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            Object.keys(nextPending).forEach(fieldKey => {
                const required = rowMeta?.fields.find(item => item.required && item.key === fieldKey)
                const isEmpty =
                    nextPending[fieldKey] === null ||
                    nextPending[fieldKey] === undefined ||
                    nextPending[fieldKey] === '' ||
                    (Array.isArray(nextPending[fieldKey]) && Object.keys(nextPending[fieldKey]).length === 0)
                if (required && isEmpty) {
                    nextValidationFails[fieldKey] = i18n.t('This field is mandatory')
                }
            })
            return {
                ...state,
                pendingDataChanges: {
                    ...state.pendingDataChanges,
                    [action.payload.bcName]: {
                        ...prevBc,
                        [action.payload.cursor]: nextPending
                    }
                },
                pendingValidationFails: isTargetFormatPVF
                    ? {
                          ...(state.pendingValidationFails as PendingValidationFails),
                          [actionBcName]: {
                              ...(state.pendingValidationFails[actionBcName] as { [cursor: string]: Record<string, string> }),
                              [action.payload.cursor]: nextValidationFails
                          }
                      }
                    : nextValidationFails
            }
        }
        case types.changeDataItems: {
            const newPendingChanges = { ...state.pendingDataChanges[action.payload.bcName] }
            action.payload.cursors.forEach((cursor, index) => {
                newPendingChanges[cursor] = action.payload.dataItems[index]
            })
            return {
                ...state,
                pendingDataChanges: {
                    ...state.pendingDataChanges,
                    [action.payload.bcName]: newPendingChanges
                }
            }
        }
        case types.dropAllAssociations: {
            const pendingDataChanges = { ...state.pendingDataChanges }
            action.payload.bcNames.forEach(bcName => {
                const pendingBcChanges: Record<string, PendingDataItem> = {}
                ;(store.data[bcName] || [])
                    .filter(item => item._associate)
                    .forEach(item => {
                        pendingBcChanges[item.id] = { id: item.id, _associate: false }
                    })
                Object.keys(pendingDataChanges[bcName] || {}).forEach(itemId => {
                    pendingBcChanges[itemId] = { id: itemId, _associate: false }
                })
                pendingDataChanges[bcName] = pendingBcChanges
            })
            const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            const pendingValidationFails = { ...state.pendingValidationFails }
            if (isTargetFormatPVF) {
                action.payload.bcNames.forEach(i => {
                    pendingValidationFails[i] = {}
                })
            }
            return {
                ...state,
                pendingDataChanges,
                pendingValidationFails: isTargetFormatPVF ? pendingValidationFails : initialState.pendingValidationFails
            }
        }
        case types.dropAllAssociationsSameBc: {
            const pendingDataChanges = { ...state.pendingDataChanges }

            Object.entries({ ...store.depthData, 1: store.data }).forEach(([depthLevelKey, depthLevelData]) => {
                const depthLevel = Number(depthLevelKey)
                const pendingBcChanges: Record<string, PendingDataItem> = {}
                if (depthLevel >= action.payload.depthFrom && depthLevelData[action.payload.bcName]) {
                    depthLevelData[action.payload.bcName]
                        .filter((item: any) => item._associate)
                        .forEach((item: any) => {
                            pendingBcChanges[item.id] = { _associate: false }
                        })
                }
                pendingDataChanges[action.payload.bcName] = pendingBcChanges
            })
            const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target

            return {
                ...state,
                pendingDataChanges,
                pendingValidationFails: isTargetFormatPVF
                    ? {
                          ...(state.pendingValidationFails as PendingValidationFails),
                          [action.payload.bcName]: {}
                      }
                    : initialState.pendingValidationFails
            }
        }
        case types.dropAllAssociationsFull: {
            const bcName = action.payload.bcName
            const pendingDataChanges = { ...state.pendingDataChanges }
            const dropDesc = action.payload.dropDescendants

            const pendingBcChanges: Record<string, PendingDataItem> = {}
            ;(store.data[bcName] || [])
                .filter(item => item._associate)
                .forEach(item => {
                    if ((dropDesc && item.level === action.payload.depth) || item.level >= action.payload.depth) {
                        pendingBcChanges[item.id] = { ...item, _associate: false }
                    }
                })
            Object.entries(pendingDataChanges[bcName] || {}).forEach(([itemId, item]) => {
                if ((dropDesc && item.level === action.payload.depth) || item.level >= action.payload.depth) {
                    pendingBcChanges[itemId] = { ...item, _associate: false }
                }
            })
            pendingDataChanges[bcName] = pendingBcChanges
            const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target

            return {
                ...state,
                pendingDataChanges,
                pendingValidationFails: isTargetFormatPVF
                    ? {
                          ...(state.pendingValidationFails as PendingValidationFails),
                          [action.payload.bcName]: {}
                      }
                    : initialState.pendingValidationFails
            }
        }
        case types.sendOperationSuccess:
        case types.bcSaveDataSuccess: {
            const prevBc = state.pendingDataChanges[action.payload.bcName] || {}
            const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            return {
                ...state,
                pendingDataChanges: {
                    ...state.pendingDataChanges,
                    [action.payload.bcName]: {
                        ...prevBc,
                        [action.payload.cursor]: {}
                    }
                },
                pendingValidationFails: isTargetFormatPVF
                    ? {
                          ...(state.pendingValidationFails as PendingValidationFails),
                          [action.payload.bcName]: {
                              ...(state.pendingValidationFails[action.payload.bcName] as { [cursor: string]: Record<string, string> }),
                              [action.payload.cursor]: {}
                          }
                      }
                    : initialState.pendingValidationFails,
                handledForceActive: {
                    ...state.handledForceActive,
                    [action.payload.bcName]: {
                        ...(state.handledForceActive[action.payload.bcName] || {}),
                        [action.payload.cursor]: {}
                    }
                }
            }
        }
        case types.bcCancelPendingChanges: {
            // TODO: Check if this works for hierarchy after 1.1.0
            const pendingDataChanges = { ...state.pendingDataChanges }
            for (const bcName in state.pendingDataChanges) {
                if (action.payload ? action.payload.bcNames.includes(bcName) : true) {
                    pendingDataChanges[bcName] = {}
                }
            }
            const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            let pendingValidationFails = { ...state.pendingValidationFails }
            if (isTargetFormatPVF) {
                if (action.payload?.bcNames?.length > 0) {
                    /**
                     * Clear a `pendingValidationFails` for specific BC names
                     */
                    action.payload.bcNames.forEach(i => {
                        pendingValidationFails[i] = {}
                    })
                } else {
                    /**
                     * Clear a `pendingValidationFails` completely
                     */
                    pendingValidationFails = initialState.pendingValidationFails
                }
            }
            return {
                ...state,
                pendingDataChanges,
                pendingValidationFails: isTargetFormatPVF ? pendingValidationFails : initialState.pendingValidationFails
            }
        }
        case types.clearValidationFails: {
            return { ...state, pendingValidationFails: initialState.pendingValidationFails }
        }
        case types.showViewPopup: {
            const {
                bcName,
                calleeBCName,
                calleeWidgetName,
                associateFieldKey,
                assocValueKey,
                active,
                isFilter,
                type,
                widgetName
            } = action.payload
            const widgetValueKey = store.view.widgets.find(item => item.bcName === bcName)?.options?.displayedValueKey
            return {
                ...state,
                popupData: {
                    widgetName,
                    type,
                    bcName,
                    calleeBCName,
                    calleeWidgetName,
                    associateFieldKey,
                    assocValueKey: assocValueKey ?? widgetValueKey,
                    active,
                    isFilter
                }
            }
        }
        case types.showFileUploadPopup: {
            const bcName = state.widgets.find(item => item.name === action.payload.widgetName)?.bcName
            return {
                ...state,
                popupData: {
                    type: 'file-upload',
                    bcName, // should be null
                    calleeBCName: bcName
                }
            }
        }
        case types.viewPutPickMap:
            return { ...state, pickMap: action.payload.map }
        case types.viewClearPickMap:
            return { ...state, pickMap: null }
        case types.closeViewPopup:
            return { ...state, popupData: { bcName: null } }
        case types.selectTableCell:
            return {
                ...state,
                selectedCell: {
                    widgetName: action.payload.widgetName,
                    rowId: action.payload.rowId,
                    fieldKey: action.payload.fieldKey
                }
            }
        case types.changeLocation:
            return {
                ...state,
                pendingDataChanges: initialState.pendingDataChanges,
                selectedCell: initialState.selectedCell
            }
        case types.showNotification: {
            return {
                ...state,
                systemNotifications: [
                    ...state.systemNotifications,
                    {
                        type: action.payload.type,
                        message: action.payload.message,
                        id: state.systemNotifications.length
                    }
                ]
            }
        }
        case types.closeNotification: {
            return {
                ...state,
                systemNotifications: state.systemNotifications.filter(item => item.id !== action.payload.id)
            }
        }
        case types.showViewError: {
            return { ...state, error: action.payload.error }
        }
        case types.operationConfirmation: {
            return { ...state, modalInvoke: action.payload }
        }
        case types.closeConfirmModal: {
            return { ...state, modalInvoke: null }
        }
        case types.closeViewError:
            return { ...state, error: null }
        case types.processPostInvoke:
            return { ...state, selectedCell: null }
        default:
            return state
    }
}

export default view
