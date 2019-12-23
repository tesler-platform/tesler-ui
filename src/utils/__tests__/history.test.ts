import {makeRelativeUrl, parseBcCursors} from '../history'

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
