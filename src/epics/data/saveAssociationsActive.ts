import { $do, Epic, types } from '../../actions/actions'
import { buildBcUrl } from '../../utils/strings'
import * as api from '../../api/api'
import { AssociatedItem } from '../../interfaces/operation'
import { Observable } from 'rxjs/Observable'

/**
 * Works with assoc-lists, which does call back-end's assoc methods by click on confirm button in modal window
 *
 * @category Epics
 */
export const saveAssociationsActive: Epic = (action$, store) =>
    action$
        .ofType(types.saveAssociations)
        .filter(action => {
            return store.getState().view.popupData.active
        })
        .switchMap(action => {
            const state = store.getState()
            const calleeBCName = state.view.popupData.calleeBCName
            const calleeWidgetName = state.view.popupData.calleeWidgetName
            const bcNames = action.payload.bcNames
            const bcUrl = buildBcUrl(calleeBCName, true)
            const pendingChanges = state.view.pendingDataChanges[bcNames[0]] || {}
            const params: Record<string, any> = bcNames.length ? { _bcName: bcNames[bcNames.length - 1] } : {}
            return api
                .associate(
                    state.screen.screenName,
                    bcUrl,
                    (Object.values(pendingChanges) as AssociatedItem[]).filter(i => i._associate),
                    params
                )
                .mergeMap(response => {
                    const postInvoke = response.postActions[0]
                    const calleeWidget = state.view.widgets.find(widgetItem => widgetItem.bcName === calleeBCName)
                    return Observable.concat(
                        postInvoke
                            ? Observable.of($do.processPostInvoke({ bcName: calleeBCName, postInvoke, widgetName: calleeWidget.name }))
                            : Observable.empty<never>(),
                        Observable.of($do.bcCancelPendingChanges({ bcNames: bcNames })),
                        Observable.of($do.bcForceUpdate({ bcName: calleeBCName, widgetName: calleeWidgetName }))
                    )
                })
                .catch(err => {
                    console.error(err)
                    return Observable.empty<never>()
                })
        })
