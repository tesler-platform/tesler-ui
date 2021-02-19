import { AnyAction, types } from '../actions/actions'
import { DataState, DataItem } from '../interfaces/data'

const initialState: DataState = {}
const emptyData: DataItem[] = []

/**
 * Data reducer
 *
 * Stores data (i.e. records, rows) for Business Components
 *
 * @param state Data branch of Redux store
 * @param action Redux action
 * @param store Store instance for read-only access of different branches of Redux store
 */
export function data(state = initialState, action: AnyAction) {
    switch (action.type) {
        case types.bcFetchDataSuccess: {
            return {
                ...state,
                [action.payload.bcName]: action.payload.data
            }
        }
        case types.bcNewDataSuccess: {
            return {
                ...state,
                [action.payload.bcName]: [...(state[action.payload.bcName] || emptyData), action.payload.dataItem]
            }
        }
        case types.bcSaveDataSuccess: {
            const nextDataItem = action.payload.dataItem
            return {
                ...state,
                [action.payload.bcName]: (state[action.payload.bcName] || emptyData).map(item =>
                    item.id === nextDataItem.id ? nextDataItem : item
                )
            }
        }
        case types.bcFetchRowMetaSuccess: {
            const cursor = action.payload.cursor
            if (!cursor) {
                return state
            }
            const prevDataItem = (state[action.payload.bcName] || emptyData).find(item => item.id === cursor)
            const nextDataItem: DataItem = {
                ...prevDataItem,
                id: cursor,
                vstamp: -1,
                _associate: prevDataItem && prevDataItem._associate
            }
            // BC is unable to update value from row meta if id is null
            const valueUpdateUnsupported = action.payload.rowMeta.fields.find(item => item.key === 'id' && !item.currentValue)
            if (valueUpdateUnsupported) {
                return state
            }
            action.payload.rowMeta.fields
                .filter(field => {
                    // TODO: check if previous condition covered that case
                    return field.key !== '_associate'
                })
                .forEach(field => (nextDataItem[field.key] = field.currentValue))

            if (!prevDataItem) {
                return {
                    ...state,
                    [action.payload.bcName]: [...(state[action.payload.bcName] || emptyData), nextDataItem]
                }
            }
            return {
                ...state,
                [action.payload.bcName]: state[action.payload.bcName].map(item => (item === prevDataItem ? nextDataItem : item))
            }
        }
        case types.changeAssociations:
            return {
                ...state,
                [`${action.payload.bcName}Delta`]: action.payload.records
            }
        case types.selectView: {
            return initialState
        }
        default:
            return state
    }
}

export default data
