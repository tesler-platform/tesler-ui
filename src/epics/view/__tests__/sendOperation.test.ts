import { customAction } from '../../../api'
import { Observable } from 'rxjs'
import * as api from '../../../api/api'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { $do } from '../../../actions/actions'
import { mockStore } from '../../../tests/mockStore'
import { sendOperation } from '../sendOperation'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import { FilterType } from '../../../interfaces/filters'

const customActionMock = jest.fn().mockImplementation((...args: Parameters<typeof customAction>) => {
    const [screenName] = args
    if (screenName === 'fail') {
        throw Error('test request crash')
    }
    return Observable.of({ data: [{ id: '1', vstamp: 1 }], hasNext: true })
})
const consoleMock = jest.fn().mockImplementation(e => console.warn(e))

jest.spyOn<any, any>(api, 'customAction').mockImplementation(customActionMock)
jest.spyOn(console, 'error').mockImplementation(consoleMock)

describe('sendOperation', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.screenName = 'test'
        store.getState().screen.bo.bc.bcExample = bcExample
        store.getState().data[bcExample.name] = dataExample
    })

    it('call customAction api', () => {
        const action = $do.sendOperation({
            bcName: bcExample.name,
            operationType: 'someCustomAction',
            widgetName: 'exWidgetName'
        })
        const epic = sendOperation(ActionsObservable.of(action), store)
        testEpic(epic, () => {
            expect(customActionMock).toBeCalledWith(
                'test',
                'bcExample/1',
                { vstamp: 1 },
                { widgetName: 'exWidgetName' },
                { _action: 'someCustomAction' }
            )
        })
    })

    it('call customAction api with confirm', () => {
        const action = $do.sendOperation({
            confirm: 'confirm',
            bcName: bcExample.name,
            operationType: 'someCustomAction',
            widgetName: 'exWidgetName'
        })
        const epic = sendOperation(ActionsObservable.of(action), store)
        testEpic(epic, () => {
            expect(customActionMock).toBeCalledWith(
                'test',
                'bcExample/1',
                { vstamp: 1 },
                { widgetName: 'exWidgetName' },
                { _action: 'someCustomAction', _confirm: 'confirm' }
            )
        })
    })

    it('call customAction api with filters ans sorters', () => {
        store.getState().screen.sorters = {
            bcExample: [
                {
                    fieldName: 'name',
                    direction: 'desc'
                }
            ]
        }
        store.getState().screen.filters = {
            bcExample: [{ type: FilterType.equalsOneOf, fieldName: 'countryList', value: ['Germany'] }]
        }
        const action = $do.sendOperation({
            bcName: bcExample.name,
            operationType: 'someCustomAction',
            widgetName: 'exWidgetName'
        })
        const epic = sendOperation(ActionsObservable.of(action), store)
        testEpic(epic, () => {
            expect(customActionMock).toBeCalledWith(
                'test',
                'bcExample/1',
                { vstamp: 1 },
                { widgetName: 'exWidgetName' },
                { _action: 'someCustomAction', 'countryList.equalsOneOf': '["Germany"]', '_sort.0.desc': 'name' }
            )
        })
    })
})

const dataExample = [{ id: '1', vstamp: 1 }]

const bcExample = {
    name: 'bcExample',
    parentName: null as string,
    url: 'bcExample/:id',
    cursor: '1',
    page: 2,
    limit: 5,
    loading: false
}
