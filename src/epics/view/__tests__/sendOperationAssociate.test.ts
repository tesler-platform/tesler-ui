import { sendOperationAssociate } from '../sendOperationAssociate'
import { testEpic } from '../../../tests/testEpic'
import { $do } from '../../../actions/actions'
import { OperationTypeCrud } from '../../../interfaces/operation'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'
import { of as observableOf } from 'rxjs'

describe('showFileUploadPopup', () => {
    const store$ = createMockStateObservable()

    it('fires `showViewPopup` with `bcName` templated as `${bcName}Assoc`', () => {
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: OperationTypeCrud.associate,
            widgetName: 'test-widget'
        })
        testEpic(sendOperationAssociate(observableOf(action), store$), result => {
            expect(result.length).toBe(1)
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.showViewPopup({
                        bcName: 'bcExampleAssoc',
                        calleeWidgetName: 'test-widget',
                        calleeBCName: 'bcExample',
                        active: true
                    })
                )
            )
        })
    })

    it('fires `showViewPopup` with `bcName` templated as `bcKey` if specified', () => {
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: OperationTypeCrud.associate,
            widgetName: 'test-widget',
            bcKey: 'some-value'
        })
        testEpic(sendOperationAssociate(observableOf(action), store$), result => {
            expect(result.length).toBe(1)
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.showViewPopup({
                        bcName: 'some-value',
                        calleeWidgetName: 'test-widget',
                        calleeBCName: 'bcExample',
                        active: true
                    })
                )
            )
        })
    })
})
