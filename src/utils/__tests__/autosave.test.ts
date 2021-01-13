import { mockStore } from '../../tests/mockStore'
import { checkUnsavedChangesOfBc, bcHasPendingAutosaveChanges, autosaveRoutine } from '../autosave'
import { OperationTypeCrud } from '../../interfaces/operation'

describe('autosave utils test', () => {
    const store = mockStore()
    const state = store.getState()
    describe('autosaveRoutine test', () => {
        const nextMock = jest.fn()
        const dispatchMock = jest.fn()
        afterEach(() => {
            nextMock.mockRestore()
            dispatchMock.mockRestore()
        })
        it('1. should skip action', () => {
            const testState = { ...state }
            autosaveRoutine({ type: 'test' }, { getState: () => testState, dispatch: dispatchMock }, nextMock)
            expect(nextMock).toHaveBeenCalledWith({ type: 'test' })
        })
        it('1. should save one BC', () => {
            const testBcName = 'test1'
            const testCursor = '111'
            const testWidgetName = 'test1Widget'
            const testState = { ...state }
            const testAction = {
                type: 'test',
                payload: {
                    bcName: testBcName
                }
            }
            testState.screen.bo.bc[testBcName] = {
                name: testBcName,
                cursor: testCursor,
                parentName: '',
                url: ''
            }
            testState.view.widgets = [
                {
                    name: testWidgetName,
                    bcName: testBcName,
                    type: 'List',
                    title: 'TEST',
                    position: 1,
                    gridWidth: 2,
                    fields: []
                }
            ]
            testState.view.pendingDataChanges[testBcName] = {}
            testState.view.pendingDataChanges[testBcName][testCursor] = { id: 999999 }
            autosaveRoutine(testAction, { getState: () => testState, dispatch: dispatchMock }, nextMock)
            expect(nextMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'sendOperation',
                    payload: expect.objectContaining({
                        bcName: testBcName,
                        operationType: OperationTypeCrud.save,
                        widgetName: testWidgetName,
                        onSuccessAction: testAction
                    })
                })
            )
        })
        it('1. should save two BCs', () => {
            const testBcName = 'test1'
            const testCursor = '111'
            const testWidgetName = 'test1Widget'
            const testBcName1 = 'test2'
            const testCursor1 = '222'
            const testWidgetName1 = 'test2Widget'
            const testState = { ...state }
            const testAction = {
                type: 'test',
                payload: {
                    bcName: testBcName
                }
            }
            testState.screen.bo.bc[testBcName] = {
                name: testBcName,
                cursor: testCursor,
                parentName: '',
                url: ''
            }
            testState.screen.bo.bc[testBcName1] = {
                name: testBcName1,
                cursor: testCursor1,
                parentName: '',
                url: ''
            }
            testState.view.widgets = [
                {
                    name: testWidgetName,
                    bcName: testBcName,
                    type: 'List',
                    title: 'TEST',
                    position: 1,
                    gridWidth: 2,
                    fields: []
                },
                {
                    name: testWidgetName1,
                    bcName: testBcName1,
                    type: 'List',
                    title: 'TEST1',
                    position: 2,
                    gridWidth: 2,
                    fields: []
                }
            ]
            testState.view.pendingDataChanges[testBcName] = {}
            testState.view.pendingDataChanges[testBcName][testCursor] = { id: 999999 }
            testState.view.pendingDataChanges[testBcName1] = {}
            testState.view.pendingDataChanges[testBcName1][testCursor1] = { id: 6666666 }
            autosaveRoutine(testAction, { getState: () => testState, dispatch: dispatchMock }, nextMock)
            expect(dispatchMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'sendOperation',
                    payload: expect.objectContaining({
                        bcName: testBcName1,
                        widgetName: testWidgetName1
                    })
                })
            )
            expect(nextMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'sendOperation',
                    payload: expect.objectContaining({
                        bcName: testBcName,
                        operationType: OperationTypeCrud.save,
                        widgetName: testWidgetName,
                        onSuccessAction: testAction
                    })
                })
            )
        })
    })

    describe('bcHasPendingAutosaveChanges test', () => {
        const testBcName = 'test'
        const testCursor = '1111'

        it('1. should return `true`', () => {
            const testState = { ...state }
            testState.view.pendingDataChanges[testBcName] = {}
            testState.view.pendingDataChanges[testBcName][testCursor] = { id: 11121 }
            const res = bcHasPendingAutosaveChanges(testState, testBcName, testCursor)
            expect(res).toBeTruthy()
        })
        it('1. should return `false`', () => {
            const testState = { ...state }
            testState.view.pendingDataChanges[testBcName] = {}
            const res = bcHasPendingAutosaveChanges(testState, testBcName, testCursor)
            expect(res).toBeFalsy()
        })
        it('2. should return `false`', () => {
            const testState = { ...state }
            testState.view.pendingDataChanges[testBcName][testCursor] = {}
            const res = bcHasPendingAutosaveChanges(testState, testBcName, testCursor)
            expect(res).toBeFalsy()
        })
        it('3. should return `false`', () => {
            const testState = { ...state }
            testState.view.pendingDataChanges[testBcName][testCursor] = { _associate: 'test' }
            const res = bcHasPendingAutosaveChanges(testState, testBcName, testCursor)
            expect(res).toBeFalsy()
        })
        it('4. should return `false`', () => {
            const testState = { ...state }
            testState.view.pendingDataChanges[testBcName][testCursor] = { _associate: 'test', id: 11121 }
            const res = bcHasPendingAutosaveChanges(testState, testBcName, testCursor)
            expect(res).toBeFalsy()
        })
    })

    describe('checkUnsavedChangesOfBc test', () => {
        it('1. should return `false`', () => {
            const testState = { ...state }
            const res = checkUnsavedChangesOfBc(testState, 'test')
            expect(res).toBeFalsy()
        })
        it('2. should return `false`', () => {
            const testState = { ...state }
            testState.view.pendingDataChanges.test = {}
            const res = checkUnsavedChangesOfBc(testState, 'test')
            expect(res).toBeFalsy()
        })
        it('3. should return `false`', () => {
            const testState = { ...state }
            testState.view.pendingDataChanges.test['111'] = {}
            testState.view.pendingDataChanges.test['222'] = {}
            const res = checkUnsavedChangesOfBc(testState, 'test')
            expect(res).toBeFalsy()
        })
        it('1. should return `true`', () => {
            const testState = { ...state }
            testState.view.pendingDataChanges.test['111'] = {}
            testState.view.pendingDataChanges.test['222'] = { id: 11111 }
            const res = checkUnsavedChangesOfBc(testState, 'test')
            expect(res).toBeTruthy()
        })
        it('2. should return `true`', () => {
            const testState = { ...state }
            testState.view.pendingDataChanges.test['111'] = { id: 222 }
            testState.view.pendingDataChanges.test['222'] = { id: 11111 }
            const res = checkUnsavedChangesOfBc(testState, 'test')
            expect(res).toBeTruthy()
        })
    })
})
