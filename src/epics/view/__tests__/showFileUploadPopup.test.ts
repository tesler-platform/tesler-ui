import { showFileUploadPopup } from '../showFileUploadPopup'
import { testEpic } from '../../../tests/testEpic'
import { $do, types as coreActions } from '../../../actions/actions'
import { OperationTypeCrud } from '../../../interfaces/operation'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'
import { of as observableOf } from 'rxjs'

describe('showFileUploadPopup', () => {
    const store$ = createMockStateObservable()
    it('fires `bcChangeCursors` and `showFileUploadPopup`', () => {
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: OperationTypeCrud.fileUpload,
            widgetName: 'test-widget'
        })
        testEpic(showFileUploadPopup(observableOf(action), store$), result => {
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
