import { Store } from 'redux'
import { Store as CoreStore } from '../../interfaces/store'
import { mockStore } from '../../tests/mockStore'
import { cancelRequestEpic } from '../cancelRequestEpic'
import { $do, types } from '../../actions/actions'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../tests/testEpic'

const bcExample = {
    name: 'bcExample',
    parentName: null as string,
    url: '',
    cursor: null as string,
    loading: false
}

describe('cancelRequestEpic test', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.bo.bc.bcExample = bcExample
    })

    it('should return set epic', () => {
        const action = $do.logout(null)
        const epic = cancelRequestEpic(
            ActionsObservable.of(action),
            [types.logout],
            () => null,
            $do.bcFetchRowMetaFail({ bcName: bcExample.name }),
            item => {
                return true
            }
        )
        testEpic(epic, result => {
            expect(result.length).toEqual(1)
            expect(result[0]).toEqual(
                expect.objectContaining({
                    type: types.bcFetchRowMetaFail,
                    payload: expect.objectContaining({
                        bcName: bcExample.name
                    })
                })
            )
        })
    })
    it('should return set epic', () => {
        const action = $do.logout(null)
        const epic = cancelRequestEpic(
            ActionsObservable.of(action),
            [types.logout],
            () => null,
            $do.bcFetchRowMetaFail({ bcName: bcExample.name })
        )
        testEpic(epic, result => {
            expect(result.length).toEqual(1)
            expect(result[0]).toEqual(
                expect.objectContaining({
                    type: types.bcFetchRowMetaFail,
                    payload: expect.objectContaining({
                        bcName: bcExample.name
                    })
                })
            )
        })
    })
})
