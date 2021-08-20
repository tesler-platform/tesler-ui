import { AnyAction, types } from '../actions/actions'
import { ScreenState } from '../interfaces/screen'
import { BcMeta, BcMetaState } from '../interfaces/bc'
import { OperationTypeCrud } from '../interfaces/operation'
import { parseFilters, parseSorters } from '../utils/filters'
import { BcFilter, BcSorter } from '../interfaces/filters'
import { Store } from 'interfaces/store'
import { WidgetField, FieldType } from '@tesler-ui/schema'

export const initialState: ScreenState = {
    screenName: null,
    bo: { activeBcName: null, bc: {} },
    cachedBc: {},
    views: [],
    primaryView: '',
    filters: {},
    sorters: {}
}

/**
 * Screen reducer
 *
 * Stores information about currently active screen and various more persistent values which should be stored
 * until we navitage to a different screen.
 *
 * @param state Screen branch of Redux store
 * @param action Redux action
 * @param store Store instance for read-only access of different branches of Redux store
 */
export function screen(state = initialState, action: AnyAction, store: Store): ScreenState {
    switch (action.type) {
        case types.selectScreen: {
            const bcDictionary: Record<string, BcMeta> = {}
            const bcSorters: Record<string, BcSorter[]> = {}
            const bcFilters: Record<string, BcFilter[]> = {}
            action.payload.screen.meta.bo.bc.forEach(item => {
                bcDictionary[item.name] = item
                const sorter = parseSorters(item.defaultSort)
                const filter = parseFilters(item.defaultFilter)
                if (sorter) {
                    bcSorters[item.name] = sorter
                }
                if (filter) {
                    bcFilters[item.name] = filter
                }
            })
            return {
                ...state,
                screenName: action.payload.screen.name,
                primaryView: action.payload.screen.meta.primary,
                views: action.payload.screen.meta.views,
                bo: { activeBcName: null, bc: bcDictionary },
                sorters: { ...state.sorters, ...bcSorters },
                filters: { ...state.filters, ...bcFilters }
            }
        }
        case types.selectScreenFail: {
            return { ...state, screenName: action.payload.screenName, views: [] }
        }
        case types.bcFetchDataRequest: {
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            loading: true
                        }
                    }
                }
            }
        }
        case types.bcLoadMore: {
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            page: state.bo.bc[action.payload.bcName].page + 1,
                            loading: true
                        }
                    }
                }
            }
        }
        case types.selectView: {
            const newBcs: Record<string, BcMetaState> = {}
            Array.from(
                new Set(action.payload.widgets.map(widget => widget.bcName)) // БК которые есть на вьюхе
            )
                .filter(bcName => state.bo.bc[bcName])
                .forEach(bcName => {
                    newBcs[bcName] = { ...state.bo.bc[bcName], page: 1 }
                })
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        ...newBcs
                    }
                }
            }
        }
        case types.bcFetchDataSuccess: {
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            hasNext: action.payload.hasNext,
                            loading: false
                        }
                    }
                },
                cachedBc: {
                    ...state.cachedBc,
                    [action.payload.bcName]: action.payload.bcUrl
                }
            }
        }
        case types.bcFetchDataFail: {
            if (Object.values(state.bo.bc).some(bc => bc.name === action.payload.bcName)) {
                return {
                    ...state,
                    bo: {
                        ...state.bo,
                        bc: {
                            ...state.bo.bc,
                            [action.payload.bcName]: {
                                ...state.bo.bc[action.payload.bcName],
                                loading: false
                            }
                        }
                    },
                    cachedBc: {
                        ...state.cachedBc,
                        [action.payload.bcName]: action.payload.bcUrl
                    }
                }
            } else {
                return { ...state }
            }
        }
        case types.sendOperation: {
            return operationsHandledLocally.includes(action.payload.operationType)
                ? state
                : {
                      ...state,
                      bo: {
                          ...state.bo,
                          bc: {
                              ...state.bo.bc,
                              [action.payload.bcName]: {
                                  ...state.bo.bc[action.payload.bcName],
                                  loading: true
                              }
                          }
                      }
                  }
        }
        case types.sendOperationSuccess:
        case types.bcDeleteDataFail:
        case types.sendOperationFail:
        case types.bcSaveDataSuccess:
        case types.bcSaveDataFail: {
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            loading: false
                        }
                    }
                }
            }
        }
        case types.bcNewDataSuccess: {
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            loading: false,
                            cursor: action.payload.dataItem.id
                        }
                    }
                },
                cachedBc: {
                    ...state.cachedBc,
                    [action.payload.bcName]: action.payload.bcUrl
                }
            }
        }
        case types.bcChangeCursors: {
            const newCursors: Record<string, BcMetaState> = {}
            const newCache: Record<string, string> = {}
            Object.entries(action.payload.cursorsMap).forEach(entry => {
                const [bcName, cursor] = entry
                newCursors[bcName] = { ...state.bo.bc[bcName], cursor }
                newCache[bcName] = cursor
            })
            // Also reset cursors of all children of requested BCs
            const changedParents = Object.values(newCursors).map(bc => `${bc.url}/:id`)
            Object.values(state.bo.bc).forEach(bc => {
                if (changedParents.some(item => bc.url.includes(item))) {
                    newCursors[bc.name] = { ...state.bo.bc[bc.name], cursor: null }
                    newCache[bc.name] = null
                }
            })
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: { ...state.bo.bc, ...newCursors }
                },
                cachedBc: { ...state.cachedBc, ...newCache }
            }
        }
        /**
         * @deprecated
         */
        case types.bcChangeDepthCursor: {
            const bcName = action.payload.bcName
            const depth = action.payload.depth
            const prevBc = state.bo.bc[bcName]

            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [bcName]: {
                            ...prevBc,
                            ...(depth === 1
                                ? {
                                      cursor: action.payload.cursor
                                  }
                                : {
                                      depthBc: {
                                          ...prevBc.depthBc,
                                          [depth]: {
                                              ...(prevBc.depthBc || {})[depth],
                                              cursor: action.payload.cursor
                                          }
                                      }
                                  })
                        }
                    }
                }
            }
        }
        case types.bcSelectRecord: {
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            cursor: action.payload.cursor
                        }
                    }
                }
            }
        }
        case types.bcForceUpdate: {
            const prevBc = state.bo.bc[action.payload.bcName]
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...prevBc,
                            loading: true
                        }
                    }
                },
                cachedBc: { ...state.cachedBc, [action.payload.bcName]: null }
            }
        }
        case types.bcAddFilter: {
            const { bcName, filter, widgetName } = action.payload
            const isDate = store.view.widgets
                .find(item => item.name === widgetName)
                ?.fields.find((item: WidgetField) => item.type === FieldType.date && item.key === filter.fieldName)
            const newFilter = isDate ? { ...filter, value: correctDateFilter(filter.value as string) } : filter
            const prevFilters = state.filters[bcName] || []
            const prevFilter = prevFilters.find(item => item.fieldName === filter.fieldName && item.type === filter.type)
            const newFilters = prevFilter
                ? prevFilters.map(item => (item === prevFilter ? { ...prevFilter, value: newFilter.value } : item))
                : [...prevFilters, newFilter]
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [bcName]: {
                            ...state.bo.bc[bcName],
                            page: 1
                        }
                    }
                },
                filters: {
                    ...state.filters,
                    [bcName]: newFilters
                }
            }
        }
        case types.bcRemoveFilter: {
            const { bcName, filter } = action.payload
            const prevBcFilters = state.filters[bcName] || []
            const newBcFilters = prevBcFilters.filter(item => item.fieldName !== filter?.fieldName || item.type !== filter.type)
            const newFilters = { ...state.filters, [bcName]: newBcFilters }
            if (!newBcFilters.length) {
                delete newFilters[bcName]
            }
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            page: 1
                        }
                    }
                },
                filters: newFilters
            }
        }
        case types.bcRemoveAllFilters: {
            const filters = { ...state.filters }
            delete filters[action.payload.bcName]
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            page: 1
                        }
                    }
                },
                filters
            }
        }
        case types.bcAddSorter: {
            return {
                ...state,
                sorters: {
                    ...state.sorters,
                    [action.payload.bcName]: Array.isArray(action.payload.sorter) ? action.payload.sorter : [action.payload.sorter]
                }
            }
        }
        case types.bcChangePage: {
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            page: action.payload.page,
                            loading: true
                        }
                    }
                }
            }
        }
        case types.showViewPopup: {
            return {
                ...state,
                bo: {
                    ...state.bo,
                    bc: {
                        ...state.bo.bc,
                        [action.payload.bcName]: {
                            ...state.bo.bc[action.payload.bcName],
                            page: 1,
                            loading: action.payload.bcName !== action.payload.calleeBCName
                        }
                    }
                }
            }
        }
        default:
            return state
    }
}

/**
 * Date fields are filtered by the way of selecting of local timestamp in calendar, transforming it into zero timezoned timestamp
 * and passing it as `equals` filter to Tesler API where it transformed to a day range;
 *
 * This can create problems as transforming local calendar value to zero timezoned timestamp can leave us with previous or next day.
 * This function detects if the filter value hits such cases and correts the value to 00:00 of local day
 *
 * @param timestamp Zero timezoned timestamp, e.g. `2021-08-19T22:07:16.192Z`
 */
function correctDateFilter(timestamp: string) {
    const originalDate = new Date(timestamp)
    const newDate = new Date(
        originalDate.getFullYear(),
        originalDate.getMonth(),
        originalDate.getDate(),
        -(originalDate.getTimezoneOffset() / 60)
    )
    return newDate.toISOString()
}

const operationsHandledLocally: string[] = [OperationTypeCrud.associate, OperationTypeCrud.fileUpload]

export default screen
