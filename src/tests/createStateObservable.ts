import { Subject } from 'rxjs'
import { StateObservable } from 'redux-observable'

export function createStateObservable(initialState?: any) {
    const stateInput$ = new Subject()
    const state$ = new StateObservable<any>(stateInput$, initialState)

    return state$
}
