import { $do } from '../../../actions/actions'
import { ActionsObservable } from 'redux-observable'
import { refreshMetaAndReloadPage } from '../refreshMetaAndReloadPage'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { testEpic } from '../../../tests/testEpic'

describe('refreshMetaAndReloadPage test', function () {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })

    it('should work', function () {
        const action = $do.refreshMetaAndReloadPage(null)
        const epic = refreshMetaAndReloadPage(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(result[0]).toEqual(expect.objectContaining({ payload: null, type: 'refreshMeta' }))
        })
    })
})
