import { Store as CoreStore } from '../../../interfaces/store'
import { $do, types } from '../../../actions/actions'
import { ActionsObservable, StateObservable } from 'redux-observable'
import { switchRoleEpic } from '../switchRole'
import { testEpic } from '../../../tests/testEpic'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'

describe('switchRoleEpic', () => {
    let store$: StateObservable<CoreStore> = null

    beforeAll(() => {
        store$ = createMockStateObservable()
    })

    it('should call logoutDone and login', () => {
        const action = $do.switchRole({ role: 'role' })
        const epic = switchRoleEpic(ActionsObservable.of(action), store$)
        testEpic(epic, result => {
            expect(result.length).toBe(2)
            expect(result[0].type).toBe(types.logoutDone)
            expect(result[1]).toEqual(expect.objectContaining($do.login({ login: null, password: null, role: 'role' })))
        })
    })
})
