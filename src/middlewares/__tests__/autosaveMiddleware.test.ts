import { createAutoSaveMiddleware } from '../autosaveMiddleware'
import * as mockStore from './__mocks__/store.json'
import * as mockStore1 from './__mocks__/store1.json'
import { OperationTypeCrud } from '../../interfaces/operation'
import { AnyAction } from 'redux'
import { Store } from '../../interfaces/store'

const bcName = 'exBc'

describe('saveFormMiddleware', () => {
    const initAction1 = {
        type: 'sendOperation',
        payload: {
            bcName: '1EventRootReason',
            operationType: 'create',
            widgetName: '1 Event Root Reason Edit Form'
        }
    }
    const initAction2 = {
        type: 'sendOperation',
        payload: {
            bcName: '1EventRoot1Response',
            operationType: OperationTypeCrud.cancelCreate,
            widgetName: 'RERRRCF'
        }
    }
    const doGetState = () => (mockStore as unknown) as Store
    const doGetState1 = () => (mockStore1 as unknown) as Store
    const doNext = <A = AnyAction>(action: A) => action
    const autosaveMiddleware = createAutoSaveMiddleware()
    it('should transform action', () => {
        const middleware = autosaveMiddleware({ getState: doGetState, dispatch: null })
        expect(middleware(doNext)(initAction1).payload.onSuccessAction).toBeTruthy()
    })
    it('should not transform action', () => {
        const middleware = autosaveMiddleware({ getState: doGetState1, dispatch: null })
        expect(middleware(doNext)(initAction2)).toEqual(initAction2)
    })
    it("shouldn't transform action bcChangePage inside popup", () => {
        const changePageStore = {
            ...mockStore1,
            view: {
                ...mockStore1.view,
                popupData: {
                    bcName: bcName
                }
            }
        }
        const doGetStateChangePage = () => (changePageStore as unknown) as Store
        const middleware = autosaveMiddleware({ getState: doGetStateChangePage, dispatch: null })
        const bcChangePageAction = {
            type: 'bcChangePage',
            payload: {
                bcName: bcName,
                page: 3
            }
        }
        expect(middleware(doNext)(bcChangePageAction)).toEqual(bcChangePageAction)
    })
    it('should save rest pending changes', () => {
        const restBcWidgets = mockStore.view.widgets.slice()
        restBcWidgets.push({
            id: '20362',
            vstamp: 0,
            widgetId: 5,
            position: 5,
            descriptionTitle: null,
            description: null,
            snippet: null,
            showExportStamp: false,
            limit: 0,
            type: 'List',
            url: '1Event/:id/1EventRootReason/:id/1EventRoot1Response',
            title: 'AAA',
            fields: [
                {
                    title: 'Номер',
                    key: '1Event1ResponseName',
                    drillDown: true,
                    type: 'input'
                },
                {
                    title: 'Описание',
                    key: '1Event1ResponseDescription',
                    type: 'text'
                },
                {
                    title: 'Статус',
                    key: 'reasonResponseCd',
                    type: 'dictionary'
                },
                {
                    title: 'Обоснование',
                    key: 'reasonResponseDesc',
                    type: 'text'
                }
            ],
            options: {
                actionGroups: {
                    exclude: ['save', 'associate']
                }
            },
            pivotFields: null,
            axisFields: [],
            showCondition: [],
            chart: [],
            graph: null,
            x: null,
            y: null,
            width: null,
            height: null,
            minHeight: null,
            maxHeight: null,
            minWidth: null,
            maxWidth: null,
            isDraggable: null,
            isResizable: null,
            gridWidth: 2,
            gridBreak: 0,
            hide: false,
            bcName: bcName,
            name: `widhetName${bcName}`
        })
        const restBcStore = {
            ...mockStore,
            screen: {
                ...mockStore.screen,
                bo: {
                    ...mockStore.screen.bo,
                    bc: {
                        ...mockStore.screen.bo.bc,
                        [bcName]: {
                            cursor: '1001'
                        }
                    }
                }
            },
            view: {
                ...mockStore.view,
                widgets: restBcWidgets,
                pendingDataChanges: {
                    ...mockStore.view.pendingDataChanges,
                    [bcName]: {
                        '1001': {
                            aaa: 'aaa'
                        }
                    }
                }
            }
        }
        const doGetRestBcStore = () => (restBcStore as unknown) as Store
        const args = { getState: doGetRestBcStore, dispatch: jest.fn() }
        const middleware = autosaveMiddleware(args)
        const spy = jest.spyOn(args, 'dispatch')
        middleware(doNext)(initAction1)
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })

    it('`hasAnotherUnsavedBc` condition check', () => {
        const testStore = {
            ...mockStore1,
            view: {
                ...mockStore1.view,
                pendingDataChanges: {
                    ...mockStore1.view.pendingDataChanges,
                    [bcName]: {
                        '1001': {
                            _associate: true
                        }
                    }
                }
            }
        }
        const getTestStore = () => (testStore as unknown) as Store
        const middleware = autosaveMiddleware({ getState: getTestStore, dispatch: null })
        expect(middleware(doNext)(initAction2)).toEqual(initAction2)
    })
})
