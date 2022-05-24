import { createStateObservable } from './createStateObservable'
import { mockStore } from './mockStore'

export function createMockStateObservable() {
    const store = mockStore()

    return createStateObservable(store.getState())
}
