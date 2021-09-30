import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { WidgetTypes } from '@tesler-ui/schema'
import { $do } from '../../../actions/actions'
import { getRowMetaByForceActive } from '../getRowMetaByForceActive'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import { getRmByForceActive } from '../../../api'
import { Observable } from 'rxjs'
import * as api from '../../../api/api'

const getRmByForceActiveMock = jest.fn().mockImplementation((...args: Parameters<typeof getRmByForceActive>) => {
    const [screenName] = args
    if (screenName === 'fail') {
        console.log('getRmByForceActiveMock: throw error')
        throw Error('test request crash')
    }
    return Observable.of({ data: [{ id: '1', vstamp: 1 }], hasNext: true })
})

const bcExample = {
    name: 'bcExample',
    parentName: null as string,
    url: 'bcExample/:id',
    cursor: '1',
    page: 2,
    limit: 5,
    loading: false
}

describe('getRowMetaByForceActive', () => {
    jest.spyOn<any, any>(api, 'getRmByForceActive').mockImplementation(getRmByForceActiveMock)
    let store: Store<CoreStore> = null
    const action = $do.changeDataItem({
        bcName: bcExample.name,
        cursor: bcExample.cursor,
        dataItem: {
            aa: 'aa'
        }
    })
    beforeAll(() => {
        store = mockStore()
        store.getState().screen.bo.bc.bcExample = bcExample
    })
    beforeEach(() => {
        store.getState().screen.screenName = 'test'
    })
    afterAll(() => {
        jest.resetAllMocks()
    })

    it('should not do anything for Hierarchy', () => {
        store.getState().view.widgets = [
            {
                name: 'test',
                bcName: bcExample.name,
                fields: [],
                type: WidgetTypes.AssocListPopup,
                position: 1,
                gridWidth: 2,
                title: 'test',
                options: {
                    hierarchySameBc: true
                }
            }
        ]
        const epic = getRowMetaByForceActive(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(result.length).toBe(0)
        })
    })

    it.skip('should handle request error', () => {
        store.getState().screen.screenName = 'fail'
        store.getState().view.pendingDataChanges = {
            bcExample: {
                '1': { aa: 'aa' }
            }
        }
        store.getState().view.handledForceActive = {
            bcExample: {
                '1': { aa: 'bb' }
            }
        }
        store.getState().view.rowMeta = {
            bcExample: {
                'bcExample/1': {
                    actions: [],
                    fields: [
                        {
                            forceActive: true,
                            key: 'aa',
                            currentValue: 'aa'
                        }
                    ]
                }
            }
        }
        store.getState().data = {
            bcExample: [{ id: '1', vstamp: 1 }]
        }
        const epic = getRowMetaByForceActive(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            console.log('---', result)
            // todo figure out how to test failed request
        })
    })

    it('should call popup closing after row meta request is completed', () => {
        store.getState().view.widgets = [
            { name: 'test', bcName: bcExample.name, fields: [], type: WidgetTypes.PickListPopup, position: 1, gridWidth: 2, title: 'test' }
        ]
        store.getState().view.pendingDataChanges = {
            bcExample: {
                '1': { aa: 'aa' }
            }
        }
        store.getState().view.handledForceActive = {
            bcExample: {
                '1': { aa: 'bb' }
            }
        }
        store.getState().view.rowMeta = {
            bcExample: {
                'bcExample/1': {
                    actions: [],
                    fields: [
                        {
                            forceActive: true,
                            key: 'aa',
                            currentValue: 'aa'
                        }
                    ]
                }
            }
        }
        store.getState().data = {
            bcExample: [{ id: '1', vstamp: 1 }]
        }
        store.getState().view.popupData = { widgetName: 'test' }
        const epic = getRowMetaByForceActive(ActionsObservable.of(action), store)

        testEpic(epic, result => {
            expect(result.pop()).toEqual(expect.objectContaining($do.popupCloseReady({ bcName: bcExample.name })))
        })
    })

    it.skip('should call popup closing', () => {
        store.getState().view.widgets = [
            { name: 'test', bcName: bcExample.name, fields: [], type: WidgetTypes.PickListPopup, position: 1, gridWidth: 2, title: 'test' }
        ]
        store.getState().view.pendingDataChanges = {
            bcExample: {
                '1': {}
            }
        }
        store.getState().view.popupData = { widgetName: 'test' }
        const epic = getRowMetaByForceActive(ActionsObservable.of(action), store)

        testEpic(epic, result => {
            console.log(result)
            // todo figure out how to catch delayed action
        })
    })
})
