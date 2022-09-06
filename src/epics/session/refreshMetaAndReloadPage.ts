import { Observable } from 'rxjs/Observable'
import { types, Epic, $do } from '../../actions/actions'

export const refreshMetaAndReloadPage: Epic = (action$, store): Observable<any> =>
    action$.ofType(types.refreshMetaAndReloadPage).switchMap(() => {
        return Observable.concat(
            Observable.of($do.refreshMeta(null)),
            action$
                .ofType(types.loginDone)
                .take(1)
                .switchMap(() => {
                    location.reload()
                    return Observable.empty()
                })
        )
    })
