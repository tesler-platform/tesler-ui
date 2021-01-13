import { showFileUploadPopup } from '../showFileUploadPopup'
import { mockStore } from '../../../tests/mockStore'
import { testEpic } from '../../../tests/testEpic'
import { $do, types as coreActions } from '../../../actions/actions'
import { OperationTypeCrud } from '../../../interfaces/operation'
import { ActionsObservable } from 'redux-observable'

describe('showFileUploadPopup', () => {
    const store = mockStore()
    it('fires `bcChangeCursors` and `showFileUploadPopup`', () => {
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: OperationTypeCrud.fileUpload,
            widgetName: 'test-widget'
        })
        testEpic(showFileUploadPopup(ActionsObservable.of(action), store), result => {
            expect(result.length).toBe(2)
            expect(result[0]).toEqual(
                expect.objectContaining({
                    type: coreActions.bcChangeCursors,
                    payload: { cursorsMap: { bcExample: null } }
                })
            )
            expect(result[1]).toEqual(
                expect.objectContaining({
                    type: coreActions.showFileUploadPopup,
                    payload: { widgetName: 'test-widget' }
                })
            )
        })
    })
})
