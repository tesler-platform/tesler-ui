import { combineEpics } from '../combineEpics'
import { testEpic } from '../../tests/testEpic'
import { $do, Epic, types } from '../../actions/actions'
import { ActionsObservable } from 'redux-observable'
import { mockStore } from '../../tests/mockStore'
import { Store } from 'redux'
import { Store as CoreStore } from '../../interfaces/store'
import { notification } from 'antd'
import { Observable } from 'rxjs'

const notificationMock = jest.fn()
const customImplementation = jest.fn()
jest.spyOn(notification, 'error').mockImplementation(notificationMock)

describe('combineEpics', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })

    afterEach(() => {
        notificationMock.mockClear()
        customImplementation.mockClear()
    })

    it('fires default implementation of epic', () => {
        const rootEpic = combineEpics({})
        const action = $do.selectViewFail({ viewName: 'view-example' })
        const epic = rootEpic(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            // if epic was not overriden, it fires as usual
            expect(notificationMock).toBeCalled()
            expect(res.length).toBe(0)
        })
    })

    it('fires custom implementation of epic', () => {
        // built-in epic `selectViewFail` will be disabled and custom client side epic
        // will be fired instead
        const rootEpic = combineEpics({
            routerEpics: {
                selectViewFail: customSelectViewFail
            }
        })
        const action = $do.selectViewFail({ viewName: 'view-example' })
        const epic = rootEpic(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            // default implementation disabled
            expect(notificationMock).toBeCalledTimes(0)
            // custom implementation working
            expect(customImplementation).toBeCalledTimes(1)
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectView(null)))
        })
    })

    it('disables epic override implementation set to null', () => {
        // built-in epic `selectViewFail` will be disabled and custom client side epic
        // will be fired instead
        const rootEpic = combineEpics({
            routerEpics: {
                selectViewFail: null
            }
        })
        const action = $do.selectViewFail({ viewName: 'view-example' })
        const epic = rootEpic(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            // default implementation disabled
            expect(notificationMock).toBeCalledTimes(0)
        })
    })

    it('fires new epic for the existing slice', () => {
        // new epic is introduced to built-in slice `router`
        const rootEpic = combineEpics({
            routerEpics: {
                newEpicForTheSlice: customSelectViewFail
            }
        })
        const action = $do.selectViewFail({ viewName: 'view-example' })
        const epic = rootEpic(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            // default implementation fires
            expect(notificationMock).toBeCalledTimes(1)
            // custom implementation working
            expect(customImplementation).toBeCalledTimes(1)
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectView(null)))
        })
    })

    it('fires new epic for a new slice', () => {
        // new epic is introduced to built-in slice `router`
        const rootEpic = combineEpics({
            customSliceEpics: {
                newEpicForTheSlice: customSelectViewFail
            }
        })
        const action = $do.selectViewFail({ viewName: 'view-example' })
        const epic = rootEpic(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            // custom implementation working
            expect(customImplementation).toBeCalledTimes(1)
            expect(res.length).toBe(1)
            expect(res[0]).toEqual(expect.objectContaining($do.selectView(null)))
        })
    })
})

// Declare custom epic on the client application side
const customSelectViewFail: Epic = action$ =>
    action$.ofType(types.selectViewFail).mergeMap(action => {
        customImplementation()
        return Observable.of($do.selectView(null))
    })
