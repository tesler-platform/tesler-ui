import { types, Epic } from '../actions/actions'
import { Observable } from 'rxjs/Observable'

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const loginEpic: Epic = (action$, store) =>
    action$.ofType(types.login).switchMap(action => {
        return Observable.empty()
    })

export const sessionEpics = {
    loginEpic
}
