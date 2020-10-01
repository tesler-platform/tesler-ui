import {hasPendingValidationFails} from '../requiredFieldsMiddleware'
import {mockStore} from '../../tests/mockStore'
import {PendingValidationFailsFormat} from 'interfaces/view'

let initStore = mockStore().getState()
initStore = {
    ...initStore,
    bo: {
        ...initStore.bo,
        bc: {
            test: {
            }
        }
    }
}
const bcName = Object.keys(initStore.screen.bo.bc)[0]
describe('hasPendingValidationFails target format test', () => {
    it('1. should return `false`', () =>  {
        expect(hasPendingValidationFails(initStore, bcName)).toBeFalsy()
    })
    it('2. should return `false`', () =>  {
        const store = {
            ...initStore,
            view: {
                ...initStore.view,
                pendingValidationFailsFormat: PendingValidationFailsFormat.target,
                pendingValidationFails: {
                    [bcName]: {}
                }
            }
        }
        expect(hasPendingValidationFails(store, bcName)).toBeFalsy()
    })
    it('3. should return `false`', () =>  {
        const store = {
            ...initStore,
            view: {
                ...initStore.view,
                pendingValidationFailsFormat: PendingValidationFailsFormat.target,
                pendingValidationFails: {
                    [bcName]: {
                        '1000': {}
                    }
                }
            }
        }
        expect(hasPendingValidationFails(store, bcName)).toBeFalsy()
    })
    it('1. should return `true`', () =>  {
        const store = {
            ...initStore,
            view: {
                ...initStore.view,
                pendingValidationFailsFormat: PendingValidationFailsFormat.target,
                pendingValidationFails: {
                    [bcName]: {
                        '1000': {
                            aa: 'aaa'
                        }
                    }
                }
            }
        }
        expect(hasPendingValidationFails(store, bcName)).toBeTruthy()
    })
    it('2. should return `true`', () =>  {
        const store = {
            ...initStore,
            view: {
                ...initStore.view,
                pendingValidationFailsFormat: PendingValidationFailsFormat.target,
                pendingValidationFails: {
                    'anotherBc': {},
                    [bcName]: {
                        '10001': {},
                        '1000': {
                            aa: 'aaa'
                        }
                    }
                }
            }
        }
        expect(hasPendingValidationFails(store, bcName)).toBeTruthy()
    })
})

describe('hasPendingValidationFails old format test' , () => {
    it('should return `false`', () =>  {
        expect(hasPendingValidationFails(initStore, bcName)).toBeFalsy()
    })
    it('should return `true`', () =>  {
        const store = {
            ...initStore,
            view: {
                ...initStore.view,
                pendingValidationFails: {
                    aaa: 'aaa'
                }
            }
        }
        expect(hasPendingValidationFails(store, bcName)).toBeTruthy()
    })
})
