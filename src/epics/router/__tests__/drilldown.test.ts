import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { DrillDownType, RouteType } from '../../../interfaces/router'
import { $do } from '../../../actions/actions'
import { drillDown } from '../drilldown'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import * as hstr from 'history'
import { Path, Location } from 'history'

const bcExample = {
    name: 'bcExample',
    parentName: null as string,
    url: 'bcExample/:id',
    cursor: '1',
    page: 2,
    limit: 5,
    loading: false
}

const payloadExample = {
    drillDownType: DrillDownType.inner,
    route: {
        type: RouteType.screen,
        path: 'screen/screen-example/view/example-view',
        params: {},
        screenName: 'screen-example',
        viewName: 'example-view',
        bcPath: ''
    },
    widgetName: 'widget-example'
}

const clearFiltersPayload = {
    ...payloadExample,
    url: '/screen/screen-example/view/example-view/bcExample?filters={"bcExample":""}'
}
const addFilterPayload = {
    ...payloadExample,
    url: '/screen/screen-example/view/example-view/bcExample?filters={"bcExample":"id.specified=true"}'
}

describe('drillDown epic', () => {
    let store: Store<CoreStore> = null
    const parsePathMock = (url: Path): Location<any> => {
        const splitted = url.split('?')
        return {
            state: null,
            hash: '',
            pathname: splitted[0],
            search: splitted[1]
        }
    }
    jest.spyOn(hstr, 'parsePath').mockImplementation(parsePathMock)
    beforeAll(() => {
        store = mockStore()
        store.getState().screen.screenName = 'screen-example'
        store.getState().screen.bo.bc = { bcExample }
    })
    afterAll(() => {
        store.getState().screen.filters = {}
    })

    it('should clear filters', () => {
        store.getState().screen.filters = {
            [bcExample.name]: []
        }
        const action = $do.drillDown(clearFiltersPayload)
        const mockDispatch = jest.fn()
        const epic = drillDown(ActionsObservable.of(action), { ...store, dispatch: mockDispatch })
        testEpic(epic, res => {
            expect(res.length).toBe(0)
            expect(mockDispatch).toBeCalledWith(expect.objectContaining($do.bcRemoveAllFilters({ bcName: bcExample.name })))
        })
    })

    it('should add filter', () => {
        const action = $do.drillDown(addFilterPayload)
        const mockDispatch = jest.fn()
        const epic = drillDown(ActionsObservable.of(action), { ...store, dispatch: mockDispatch })
        testEpic(epic, res => {
            expect(res.length).toBe(0)
            expect(mockDispatch).toBeCalledWith(
                expect.objectContaining(
                    $do.bcAddFilter({
                        bcName: bcExample.name,
                        filter: expect.objectContaining({ fieldName: 'id', type: 'specified', value: 'true' })
                    })
                )
            )
        })
    })
})
