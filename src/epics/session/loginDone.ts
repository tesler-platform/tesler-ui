import { Observable } from 'rxjs'
import { Epic, types } from '../../actions/actions'

/**
 * Fires on successful login; there is no default implementation related to this epic,
 * but it can be used to customize successful login behaivior.
 *
 * @param action$ This epic will fire on {@link ActionPayloadTypes.login | login} action
 * @param store Redux store instance
 * @category Epics
 */
export const loginEpic: Epic = (action$, store) =>
    action$.ofType(types.login).switchMap(action => {
        return Observable.empty()
    })
