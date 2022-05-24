import { EMPTY } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { Epic, types } from '../actions/actions'
import exportState from '../utils/exportState'
import { ofType } from 'redux-observable'

const exportStateEpic: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.exportState),
        switchMap(action => {
            exportState(store$)
            return EMPTY
        })
    )

export const utilsEpics = {
    exportStateEpic
}
