import { createAutoSaveMiddleware } from '../autosaveMiddleware'
import * as mockStore from './__mocks__/store.json'
import * as mockStore1 from './__mocks__/store1.json'
import * as mockStore2 from './__mocks__/store2.json'
import { OperationTypeCrud } from 'interfaces/operation'
import { AnyAction } from 'redux'

describe('saveFormMiddleware', () => {
    const initAction1 = {
        type: 'sendOperation',
        payload: {
            bcName: '1EventRootReason',
            operationType: 'save',
            widgetName: '1 Event Root Reason Edit Form'
        }
    }
    const initAction2 = {
        type: 'sendOperation',
        payload: {
            bcName: '1EventRoot1Response',
            operationType: OperationTypeCrud.cancelCreate,
            widgetName: 'RERRRCF',
        }
    }
    const doGetState = () => mockStore
    const doGetState1 = () => mockStore1
    const doGetState2 = () => mockStore2
    const doNext = (action: AnyAction) => action
    const autosaveMiddleware = createAutoSaveMiddleware()
    test('should transform action', () => {
        expect(autosaveMiddleware(
            // @ts-ignore
            {getState: doGetState}
            )(doNext)(initAction1).payload.onSuccessAction
        ).toBeTruthy()
    })
    test('should not transform action', () => {
        expect(autosaveMiddleware(
            // @ts-ignore
            {getState: doGetState1}
            )(doNext)(initAction2)
        ).toEqual(initAction2)
    })
    test('should  not transform action', () => {
        expect(autosaveMiddleware(
            // @ts-ignore
            {getState: doGetState2}
            )(doNext)(initAction1).payload.onSuccessAction
        ).toEqual(undefined)
    })

})
