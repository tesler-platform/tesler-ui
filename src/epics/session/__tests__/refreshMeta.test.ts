import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { $do } from '../../../actions/actions'
import { ActionsObservable } from 'redux-observable'
import { refreshMetaEpic } from '../refreshMeta'
import { testEpic } from '../../../tests/testEpic'
import { refreshMeta } from '../../../api'
import * as api from '../../../api/api'
import { Observable } from 'rxjs/Observable'

const res = {}
const refreshMetaMock = jest.fn().mockImplementation((...args: Parameters<typeof refreshMeta>) => {
    return Observable.of(res)
})
jest.spyOn<any, any>(api, 'refreshMeta').mockImplementation(refreshMetaMock)

describe('refreshMeta', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })

    afterAll(() => {
        refreshMetaMock.mockRestore()
    })
    it('should call logoutDone, login, changeLocation', () => {
        const action = $do.refreshMeta(null)
        const epic = refreshMetaEpic(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(result.length).toBe(3)
            expect(result[0]).toEqual(expect.objectContaining({ type: 'logoutDone' }))
            expect(result[1]).toEqual(expect.objectContaining({ type: 'login' }))
            expect(result[2]).toEqual(expect.objectContaining({ type: 'changeLocation' }))
        })
    })
})
