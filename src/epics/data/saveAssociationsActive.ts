import { of as observableOf, concat as observableConcat, EMPTY } from 'rxjs'
import { switchMap, filter, mergeMap, catchError } from 'rxjs/operators'
import { $do, Epic, types } from '../../actions/actions'
import { buildBcUrl } from '../../utils/strings'
import * as api from '../../api/api'
import { AssociatedItem } from '../../interfaces/operation'
import { ofType } from 'redux-observable'

/**
 * Works with assoc-lists, which does call back-end's assoc methods by click on confirm button in modal window
 *
 * @category Epics
 */
export const saveAssociationsActive: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.saveAssociations),
        filter(action => {
            return store$.value.view.popupData.active
        }),
        switchMap(action => {
            const state = store$.value
            const calleeBCName = state.view.popupData.calleeBCName
            const calleeWidgetName = state.view.popupData.calleeWidgetName
            const bcNames = action.payload.bcNames
            const bcUrl = buildBcUrl(calleeBCName, true)
            const pendingChanges = state.view.pendingDataChanges[bcNames[0]] || {}
            const params: Record<string, any> = bcNames.length ? { _bcName: bcNames[bcNames.length - 1] } : {}
            const associatedItems = Object.values(pendingChanges).filter(i => i._associate) as AssociatedItem[]
            return api.associate(state.screen.screenName, bcUrl, associatedItems, params).pipe(
                mergeMap(response => {
                    const postInvoke = response.postActions[0]
                    const calleeWidget = state.view.widgets.find(widgetItem => widgetItem.bcName === calleeBCName)
                    return observableConcat(
                        postInvoke
                            ? observableOf($do.processPostInvoke({ bcName: calleeBCName, postInvoke, widgetName: calleeWidget.name }))
                            : EMPTY,
                        observableOf($do.bcCancelPendingChanges({ bcNames: bcNames })),
                        observableOf($do.bcForceUpdate({ bcName: calleeBCName, widgetName: calleeWidgetName }))
                    )
                }),
                catchError(err => {
                    console.error(err)
                    return EMPTY
                })
            )
        })
    )
