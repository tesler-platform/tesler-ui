import {AnyAction, types} from '../actions/actions'
import {ViewState} from '../interfaces/view'
import {PendingDataItem} from '../interfaces/data'
import {Store} from '../interfaces/store'
import {OperationTypeCrud} from '../interfaces/operation'
import {buildBcUrl} from '../utils/strings'
import i18n from 'i18next'

const initialState: ViewState  = {
    id: null,
    name: null,
    url: null,
    widgets: [],
    columns: null,
    readOnly: false,
    rowHeight: null,
    rowMeta: {},
    metaInProgress: {},
    popupData: {bcName: null},
    pendingDataChanges: {},
    infiniteWidgets: [],
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
export function view(state = initialState, action: AnyAction, store: Store) {
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
                Object.entries(action.payload.entityError.fields)
                .forEach(([fieldName, violation]) => {
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
            const {bcName, bcUrl, currentRecordData, rowMeta, cursor} = action.payload
            const handledForceActive: PendingDataItem = {}
            const rowMetaForcedValues: PendingDataItem = {}
            const newPendingChangesDiff: PendingDataItem = {}
            const forceActiveFieldKeys: string[] = []

            // приведем значения переданные в forcedValue в вид дельты изменений
            rowMeta.fields.forEach((field) => {
                rowMetaForcedValues[field.key] = field.currentValue
                if (field.forceActive) {
                    forceActiveFieldKeys.push(field.key)
                }
            })

            const consolidatedFrontData: PendingDataItem = {...currentRecordData, ...state.pendingDataChanges[bcName][cursor]}
            // вычислим "разницу" между консолид.данными и полученными forcedValue's в пользу последних
            Object.keys(consolidatedFrontData).forEach((key) => {
                if (rowMetaForcedValues[key] !== undefined && consolidatedFrontData[key] !== rowMetaForcedValues[key]) {
                    newPendingChangesDiff[key] = rowMetaForcedValues[key]
                }
            })

            // консолидация полученной разницы с актуальной дельтой
            const newPendingDataChanges = {...state.pendingDataChanges[bcName][cursor], ...newPendingChangesDiff}

            // отразим в списке обработанных forceActive полей - те что содержатся в новой дельте
            forceActiveFieldKeys.forEach((key) => {
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
            const prevBc = state.pendingDataChanges[action.payload.bcName] || {}
            const prevCursor = prevBc[action.payload.cursor] || {}
            const prevPending = prevCursor || {}
            const nextPending = { ...prevPending, ...action.payload.dataItem }
            const bcUrl = buildBcUrl(action.payload.bcName, true, store)
            const rowMeta = state.rowMeta[action.payload.bcName]?.[bcUrl]
            const nextValidationFails: Record<string, string> = {}
            Object.keys(nextPending).forEach(fieldKey => {
                const required = rowMeta?.fields.find(item => item.required && item.key === fieldKey)
                const isEmpty = nextPending[fieldKey] === null
                    || nextPending[fieldKey] === undefined
                    || nextPending[fieldKey] === ''
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
                pendingValidationFails: nextValidationFails
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
                const pendingBcChanges: Record<string, PendingDataItem> = {};
                (store.data[bcName] || [])
                .filter(item => item._associate)
                .forEach(item => {
                    pendingBcChanges[item.id] = { id: item.id, _associate: false }
                })
                Object.keys(pendingDataChanges[bcName] || {})
                .forEach((itemId) => {
                    pendingBcChanges[itemId] = { id: itemId, _associate: false }
                })
                pendingDataChanges[bcName] = pendingBcChanges
            })
            return {
                ...state,
                pendingDataChanges,
                pendingValidationFails: initialState.pendingValidationFails
            }
        }
        case types.dropAllAssociationsSameBc: {
            const pendingDataChanges = { ...state.pendingDataChanges }

            Object.entries({...store.depthData, 1: store.data}).map(([depthLevelKey, depthLevelData]) => {
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

            return {
                ...state,
                pendingDataChanges,
                pendingValidationFails: initialState.pendingValidationFails
            }
        }
        case types.dropAllAssociationsFull: {
            const bcName = action.payload.bcName
            const pendingDataChanges = {...state.pendingDataChanges}
            const dropDesc = action.payload.dropDescendants

            const pendingBcChanges: Record<string, PendingDataItem> = {};
            (store.data[bcName] || [])
                .filter(item => item._associate)
                .forEach(item => {
                    if (dropDesc && item.level === action.payload.depth || item.level >= action.payload.depth) {
                        pendingBcChanges[item.id] = { ...item, _associate: false }
                    }
                })
            Object.entries(pendingDataChanges[bcName] || {})
                .forEach(([itemId, item]) => {
                    if (dropDesc && item.level === action.payload.depth || item.level >= action.payload.depth) {
                        pendingBcChanges[itemId] = { ...item, _associate: false }
                    }
                })
            pendingDataChanges[bcName] = pendingBcChanges

            return {
                ...state,
                pendingDataChanges,
                pendingValidationFails: initialState.pendingValidationFails
            }
        }
        case types.sendOperationSuccess:
        case types.bcSaveDataSuccess: {
            const prevBc = state.pendingDataChanges[action.payload.bcName] || {}
            return {
                ...state,
                pendingDataChanges: {
                    ...state.pendingDataChanges,
                    [action.payload.bcName]: {
                        ...prevBc,
                        [action.payload.cursor]: {}
                    }
                },
                pendingValidationFails: initialState.pendingValidationFails,
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
            return {
                ...state,
                pendingDataChanges,
                pendingValidationFails: initialState.pendingValidationFails
            }
        }
        case types.clearValidationFails: {
            return { ...state, pendingValidationFails: initialState.pendingValidationFails }
        }
        case types.showViewPopup: {
            const { bcName, calleeBCName, associateFieldKey, assocValueKey, active, isFilter } = action.payload
            const widgetValueKey = store.view.widgets.find(item => item.bcName === bcName)?.options?.displayedValueKey
            return {
                ...state,
                popupData: {
                    bcName,
                    calleeBCName,
                    associateFieldKey,
                    assocValueKey: assocValueKey ?? widgetValueKey,
                    active,
                    isFilter
                },
            }
        }
        case types.viewPutPickMap:
            return {...state, pickMap: action.payload.map}
        case types.viewClearPickMap:
            return {...state, pickMap: null}
        case types.closeViewPopup:
            return {...state, popupData: {bcName: null}}
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
            return { ...state, modalInvoke: action.payload}
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
