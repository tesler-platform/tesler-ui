import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { $do } from '../../../actions/actions'
import { changePopupValueAndClose } from '../changePopupValueAndClose'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'

describe('changePopupValueAndClose test', () => {
    let store: Store<CoreStore> = null
    beforeAll(() => {
        store = mockStore()
        store.getState().screen.screenName = 'test'
        store.getState().screen.bo.bc.bcExample = bcExample
    })

    it('should call changeDataItem', () => {
        const action = $do.changePopupValueAndClose({
            bcName: bcExample.name,
            cursor: bcExample.cursor,
            dataItem: {
                aa: 'aa'
            }
        })
        const epic = changePopupValueAndClose(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.changeDataItem({
                        bcName: bcExample.name,
                        cursor: bcExample.cursor,
                        dataItem: {
                            aa: 'aa'
                        }
                    })
                )
            )
        })
    })
})

const bcExample = {
    name: 'bcExample',
    parentName: null as string,
    url: 'bcExample/:id',
    cursor: '1',
    page: 2,
    limit: 5,
    loading: false
}
