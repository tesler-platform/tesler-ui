import {createAutoSaveMiddleware} from '../autosaveMiddleware'
import * as mockStore from './__mocks__/store.json'
import * as mockStore1 from './__mocks__/store1.json'
import {OperationTypeCrud} from '../../interfaces/operation'
import {AnyAction} from 'redux'
import {Store} from '../../interfaces/store'

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
    const doGetState = () => mockStore as unknown as Store
    const doGetState1 = () => mockStore1 as unknown as Store
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
})
