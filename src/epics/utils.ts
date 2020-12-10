import { Epic, types } from '../actions/actions'
import { Observable } from 'rxjs'
import exportState from '../utils/exportState'

const exportStateEpic: Epic = (action$, store) =>
    action$.ofType(types.exportState).switchMap(action => {
        exportState(store)
        return Observable.empty()
    })

export const utilsEpics = {
    exportStateEpic
}
