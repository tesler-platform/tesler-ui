import { of as observableOf } from 'rxjs'
import { Store as CoreStore } from '../../../interfaces/store'
import { $do } from '../../../actions/actions'
import { StateObservable } from 'redux-observable'
import { refreshMetaEpic } from '../refreshMeta'
import { testEpic } from '../../../tests/testEpic'
import { refreshMeta } from '../../../api'
import * as api from '../../../api/api'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'

const res = {}
const refreshMetaMock = jest.fn().mockImplementation((...args: Parameters<typeof refreshMeta>) => {
    return observableOf(res)
})
jest.spyOn<any, any>(api, 'refreshMeta').mockImplementation(refreshMetaMock)

describe('refreshMeta', () => {
    let store$: StateObservable<CoreStore> = null

    beforeAll(() => {
        store$ = createMockStateObservable()
    })

    afterAll(() => {
        refreshMetaMock.mockRestore()
    })
    it('should call logoutDone, login, changeLocation', () => {
        const action = $do.refreshMeta(null)
        const epic = refreshMetaEpic(observableOf(action), store$)
        testEpic(epic, result => {
            expect(result.length).toBe(3)
            expect(result[0]).toEqual(expect.objectContaining({ type: 'logoutDone' }))
            expect(result[1]).toEqual(expect.objectContaining({ type: 'login' }))
            expect(result[2]).toEqual(expect.objectContaining({ type: 'changeLocation' }))
        })
    })
})
