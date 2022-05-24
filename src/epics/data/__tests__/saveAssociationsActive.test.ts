import { of as observableOf, throwError as observableThrowError } from 'rxjs'
import { Store as CoreStore } from '../../../interfaces/store'
import { $do } from '../../../actions/actions'
import { saveAssociationsActive } from '../saveAssociationsActive'
import { ActionsObservable, StateObservable } from 'redux-observable'
import * as api from '../../../api/api'
import { associate } from '../../../api/api'
import { testEpic } from '../../../tests/testEpic'
import { WidgetTypes } from '@tesler-ui/schema'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'

const associateApiMock = jest.fn().mockImplementation((...args: Parameters<typeof associate>) => {
    const [screenName] = args
    if (screenName === 'crash') {
        return observableThrowError({
            response: {
                data: ''
            }
        })
    }
    return observableOf({
        records: [],
        postActions: screenName === 'withPostInvoke' ? [{ type: 'refreshBC', bc: 'meeting' }] : []
    })
})

jest.spyOn<any, any>(api, 'associate').mockImplementation(associateApiMock)
const consoleMock = jest.fn()
jest.spyOn(console, 'error').mockImplementation(consoleMock)

describe('saveAssociationsActive', () => {
    let store$: StateObservable<CoreStore> = null
    beforeAll(() => {
        store$ = createMockStateObservable()
        store$.value.view.widgets = [
            {
                name: 'meeting',
                bcName: 'meeting',
                fields: [],
                type: WidgetTypes.Info,
                position: 1,
                gridWidth: 2,
                title: 'meeting'
            }
        ]
        store$.value.view.popupData = {
            bcName: 'meetingAssoc',
            calleeBCName: 'meeting',
            calleeWidgetName: 'meetingList',
            active: true
        }
        store$.value.view.pendingDataChanges = {
            meetingAssoc: {
                '1117025': {
                    id: '1117025',
                    vstamp: 2,
                    _associate: true
                },
                '1117026': {
                    id: '1117026',
                    vstamp: 2,
                    _associate: false
                }
            }
        }
    })

    it('should send truly _associate items', function () {
        const action = $do.saveAssociations({
            bcNames: ['meetingAssoc']
        })
        const epic = saveAssociationsActive(ActionsObservable.of(action), store$)
        testEpic(epic, res => {
            expect(associateApiMock).toBeCalledWith(
                null,
                null,
                expect.objectContaining([{ id: '1117025', vstamp: 2, _associate: true }]),
                expect.objectContaining({ _bcName: 'meetingAssoc' })
            )
            expect(res.length).toBe(2)
            expect(res[0].type).toEqual('bcCancelPendingChanges')
            expect(res[1]).toEqual(
                expect.objectContaining({ type: 'bcForceUpdate', payload: { bcName: 'meeting', widgetName: 'meetingList' } })
            )
        })
    })
    it('should call postInvoke', function () {
        store$.value.screen.screenName = 'withPostInvoke'
        const action = $do.saveAssociations({
            bcNames: ['meetingAssoc']
        })
        const epic = saveAssociationsActive(ActionsObservable.of(action), store$)
        testEpic(epic, res => {
            expect(res.length).toBe(3)
            expect(res[0]).toEqual(
                expect.objectContaining({
                    type: 'processPostInvoke',
                    payload: {
                        bcName: 'meeting',
                        widgetName: 'meeting',
                        postInvoke: expect.objectContaining({ type: 'refreshBC', bc: 'meeting' })
                    }
                })
            )
        })
    })

    it('should handle error', function () {
        store$.value.screen.screenName = 'crash'
        const action = $do.saveAssociations({
            bcNames: ['meetingAssoc']
        })
        const epic = saveAssociationsActive(ActionsObservable.of(action), store$)
        testEpic(epic, () => {
            expect(consoleMock).toHaveBeenCalled()
        })
    })

    it('should send empty request body', function () {
        store$.value.screen.screenName = 'empty'
        store$.value.view.pendingDataChanges = {}
        const action = $do.saveAssociations({
            bcNames: []
        })
        const epic = saveAssociationsActive(ActionsObservable.of(action), store$)
        testEpic(epic, () => {
            expect(associateApiMock).toHaveBeenLastCalledWith('empty', null, expect.objectContaining([]), expect.objectContaining({}))
        })
    })
})
