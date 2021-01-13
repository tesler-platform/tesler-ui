import { ActionPayloadTypes, ActionsObservable, AnyAction, types } from '../actions/actions'
import { Observable } from 'rxjs'

/**
 * Default list of action types which are triggers for request cancel
 */
export const cancelRequestActionTypes = [types.selectView, types.logout]

/**
 * Creator of request cancel epic
 *
 * @param action$ an observable input
 * @param actionTypes list of action types which triggers cancel
 * @param cancelFn a callback of request cancelation
 * @param cancelActionCreator an action creator which called by request cancelation
 * @param filterFn a callback function which filters come actions
 */
export function cancelRequestEpic(
    action$: ActionsObservable<AnyAction>,
    actionTypes: Array<keyof ActionPayloadTypes>,
    cancelFn: () => void,
    cancelActionCreator: AnyAction,
    filterFn: (actions: AnyAction) => boolean = item => {
        return true
    }
) {
    return action$
        .ofType(...actionTypes)
        .filter(filterFn)
        .mergeMap(() => {
            cancelFn()
            return Observable.of(cancelActionCreator)
        })
        .take(1)
}
