import {hasPendingValidationFails} from '../requiredFieldsMiddleware'
import {mockStore} from '../../tests/mockStore'

describe('hasPendingValidationFails test', () => {
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
    it('should return `false`', () =>  {
        expect(hasPendingValidationFails(initStore, bcName)).toBeFalsy()
    })
    it('should return `false`', () =>  {
        const store = {
            ...initStore,
            view: {
                ...initStore.view,
                pendingValidationFails: {
                    [bcName]: {}
                }
            }
        }
        expect(hasPendingValidationFails(store, bcName)).toBeFalsy()
    })
    it('should return `false`', () =>  {
        const store = {
            ...initStore,
            view: {
                ...initStore.view,
                pendingValidationFails: {
                    [bcName]: {
                        '1000': {}
                    }
                }
            }
        }
        expect(hasPendingValidationFails(store, bcName)).toBeFalsy()
    })
    it('should return `true`', () =>  {
        const store = {
            ...initStore,
            view: {
                ...initStore.view,
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
    it('should return `true`', () =>  {
        const store = {
            ...initStore,
            view: {
                ...initStore.view,
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
