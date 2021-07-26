import { sendOperationAssociate } from '../sendOperationAssociate'
import { mockStore } from '../../../tests/mockStore'
import { testEpic } from '../../../tests/testEpic'
import { $do } from '../../../actions/actions'
import { OperationTypeCrud } from '../../../interfaces/operation'
import { ActionsObservable } from 'redux-observable'

describe('showFileUploadPopup', () => {
    const store = mockStore()
    it('fires `showViewPopup` with `bcName` templated as `${bcName}Assoc`', () => {
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: OperationTypeCrud.associate,
            widgetName: 'test-widget'
        })
        testEpic(sendOperationAssociate(ActionsObservable.of(action), store), result => {
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
        testEpic(sendOperationAssociate(ActionsObservable.of(action), store), result => {
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
