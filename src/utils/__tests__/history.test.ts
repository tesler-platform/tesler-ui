import { Location } from 'history'
import { Route, RouteType } from '../../interfaces/router'
import { makeRelativeUrl, parseBcCursors, defaultBuildLocation, defaultParseLocation } from '../history'

test('makeRelativeUrl', () => {
    expect(makeRelativeUrl('screen/counterparty/view/generaltasksform')).toBe('/screen/counterparty/view/generaltasksform')
    expect(makeRelativeUrl('/screen/counterparty/view/generaltasksform')).toBe('/screen/counterparty/view/generaltasksform')
})

test('parseBcCursors', () => {
    const case1 = parseBcCursors('selfEsteemRiskMain/1000567')
    expect(Object.keys(case1).length).toBe(1)
    expect(case1).toHaveProperty('selfEsteemRiskMain', '1000567')
    const case2 = parseBcCursors('counterparty/93317/counterpartyGeneralTasks/284348994430/counterpartyGeneralTasksComment')
    expect(Object.keys(case2).length).toBe(2)
    expect(case2).toHaveProperty('counterparty', '93317')
    expect(case2).toHaveProperty('counterpartyGeneralTasks', '284348994430')
})

test.skip('buildUrl', () => {
    // TODO:
})

describe('defaultParseLocation', () => {
    it('handles local navigation', () => {
        const loc: Location<any> = {
            pathname: '/screen/tutorial/view/example/bcExample/1/bcChild/5',
            search: '?param=1',
            state: null,
            hash: null
        }
        expect(defaultParseLocation(loc)).toEqual(
            expect.objectContaining({
                screenName: 'tutorial',
                viewName: 'example',
                bcPath: 'bcExample/1/bcChild/5',
                type: RouteType.screen,
                path: 'screen/tutorial/view/example/bcExample/1/bcChild/5',
                params: { param: '1' }
            })
        )
        const loc2: Location<any> = {
            pathname: '/screen/tutorial',
            search: null,
            state: null,
            hash: null
        }
        expect(defaultParseLocation(loc2)).toEqual(
            expect.objectContaining({
                screenName: 'tutorial',
                viewName: null,
                bcPath: '',
                type: RouteType.screen,
                path: 'screen/tutorial',
                params: {}
            })
        )
    })

    it('handles server routing', () => {
        const loc: Location<any> = {
            pathname: 'router/server-route/bcExample/1/bcChild/5/',
            search: '?param=1',
            state: null,
            hash: null
        }
        expect(defaultParseLocation(loc)).toEqual(
            expect.objectContaining({
                screenName: null,
                viewName: null,
                bcPath: null,
                type: RouteType.router,
                path: 'router/server-route/bcExample/1/bcChild/5',
                params: { param: '1' }
            })
        )
    })

    it('handles default url', () => {
        const loc: Location<any> = {
            pathname: '/',
            search: null,
            state: null,
            hash: null
        }
        expect(defaultParseLocation(loc)).toEqual(
            expect.objectContaining({
                screenName: null,
                viewName: null,
                bcPath: null,
                type: RouteType.default,
                path: '',
                params: {}
            })
        )
    })
})

test('defaultBuildLocation', () => {
    const route: Route = {
        screenName: 'screen-example',
        viewName: 'view-example',
        bcPath: 'bcExample/1',
        type: RouteType.screen,
        path: null,
        params: null
    }
    expect(defaultBuildLocation(route)).toBe(`/screen/screen-example/view/view-example/bcExample/1`)
})
