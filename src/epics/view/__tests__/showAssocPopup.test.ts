/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { showAssocPopup } from '../showAssocPopup'
import { StateObservable } from 'redux-observable'
import { Store as CoreStore } from '../../../interfaces/store'
import { WidgetTableMeta, WidgetTypes } from '../../../interfaces/widget'
import { FieldType } from '../../../interfaces/view'
import { $do } from '../../../actions/actions'
import { testEpic } from '../../../tests/testEpic'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'
import { of as observableOf } from 'rxjs'

describe('showAssocPopup', () => {
    let store$: StateObservable<CoreStore> = null

    beforeAll(() => {
        store$ = createMockStateObservable()
        store$.value.screen.screenName = 'test'
        store$.value.screen.bo.bc.bcExample = bcExample
        store$.value.screen.bo.bc.bcParent = getBcParent()
        store$.value.view.widgets = [getWidgetMeta()]
        store$.value.view.pendingDataChanges = getPendingData()
        store$.value.data = getData()
    })

    afterEach(() => {
        store$.value.view.widgets = [getWidgetMeta()]
        store$.value.view.pendingDataChanges = getPendingData()
        store$.value.data = getData()
        store$.value.screen.bo.bc.bcParent = getBcParent()
    })

    it('fires only for AssocListPopup', () => {
        const missingCalleeBcName = $do.showViewPopup({ bcName: bcExample.name })
        const missingCalleeBcNameEpic = showAssocPopup(observableOf(missingCalleeBcName), store$)
        testEpic(missingCalleeBcNameEpic, result => {
            expect(result).toHaveLength(0)
        })
        const missingAssociateFieldKey = $do.showViewPopup({ bcName: bcExample.name, calleeBCName: bcParent.name })
        const missingAssociateFieldKeyEpic = showAssocPopup(observableOf(missingAssociateFieldKey), store$)
        testEpic(missingAssociateFieldKeyEpic, result => {
            expect(result).toHaveLength(0)
        })
    })

    // TODO: This behaviour does not make any sense; we should check if it should not fire
    // for widgets without options
    it('does not fire for missing widgets or widgets with options but not full hierarchies (sic)', () => {
        store$.value.view.widgets[0] = {
            ...getWidgetMeta(),
            options: {}
        }
        const notFullHierarchy = $do.showViewPopup({
            bcName: bcExample.name,
            calleeBCName: bcParent.name,
            associateFieldKey: 'name'
        })
        const notFullHierarchyEpic = showAssocPopup(observableOf(notFullHierarchy), store$)
        testEpic(notFullHierarchyEpic, result => {
            expect(result).toHaveLength(0)
        })
        const missingWidget = $do.showViewPopup({
            bcName: 'bcMissing',
            calleeBCName: bcParent.name,
            associateFieldKey: 'name'
        })
        const missingWidgetEpic = showAssocPopup(observableOf(missingWidget), store$)
        testEpic(missingWidgetEpic, result => {
            expect(result).toHaveLength(0)
        })
    })

    it('does not fire for missing cursor, pending change for BC or missing field in pending change', () => {
        store$.value.screen.bo.bc[bcParent.name].cursor = null
        const missingCursor = $do.showViewPopup({
            bcName: bcExample.name,
            calleeBCName: bcParent.name,
            associateFieldKey: 'name'
        })
        const notFullHierarchyEpic = showAssocPopup(observableOf(missingCursor), store$)
        testEpic(notFullHierarchyEpic, result => {
            expect(result).toHaveLength(0)
        })
        const missingField = $do.showViewPopup({
            bcName: bcExample.name,
            calleeBCName: bcParent.name,
            associateFieldKey: 'missing'
        })
        const missingFieldEpic = showAssocPopup(observableOf(missingField), store$)
        testEpic(missingFieldEpic, result => {
            expect(result).toHaveLength(0)
        })
        const missingBc = $do.showViewPopup({
            bcName: bcExample.name,
            calleeBCName: 'bcMissing',
            associateFieldKey: 'name'
        })
        const missingBcEpic = showAssocPopup(observableOf(missingBc), store$)
        testEpic(missingBcEpic, result => {
            expect(result).toHaveLength(0)
        })
    })

    it('dispatches `changeDataItems` to init `_associate` and `_value` for popup BC from callee BC pending changes', () => {
        store$.value.view.widgets[0] = {
            ...getWidgetMeta(),
            options: undefined
        }
        delete store$.value.data[bcParent.name]
        const action = $do.showViewPopup({
            bcName: bcExample.name,
            calleeBCName: bcParent.name,
            associateFieldKey: 'name'
        })
        const epic = showAssocPopup(observableOf(action), store$)
        testEpic(epic, result => {
            const expectedAction = $do.changeDataItems({
                bcName: bcExample.name,
                cursors: ['300', '400'],
                dataItems: [
                    {
                        id: '300',
                        _associate: true,
                        _value: 'XXX-1'
                    },
                    {
                        id: '400',
                        _associate: true,
                        _value: 'XXX-2'
                    }
                ]
            })
            expect(result[0]).toEqual(expect.objectContaining(expectedAction))
        })
    })

    it('set `_associate` false for records missing in pending changes', () => {
        const action = $do.showViewPopup({
            bcName: bcExample.name,
            calleeBCName: bcParent.name,
            associateFieldKey: 'name'
        })
        const epic = showAssocPopup(observableOf(action), store$)
        testEpic(epic, result => {
            const expectedAction = $do.changeDataItems({
                bcName: bcExample.name,
                cursors: ['300', '400', '555'],
                dataItems: [
                    {
                        id: '300',
                        _associate: true,
                        _value: 'XXX-1'
                    },
                    {
                        id: '400',
                        _associate: true,
                        _value: 'XXX-2'
                    },
                    {
                        id: '555',
                        _associate: false
                    }
                ]
            })
            expect(result[0]).toEqual(expect.objectContaining(expectedAction))
        })
    })
})

function getWidgetMeta(): WidgetTableMeta {
    return {
        name: 'widget-example',
        type: WidgetTypes.AssocListPopup,
        title: null,
        bcName: 'bcExample',
        position: 1,
        gridWidth: null,
        fields: [
            {
                key: 'name',
                title: 'Test Column',
                type: FieldType.input
            }
        ],
        options: {
            hierarchyFull: true
        }
    }
}

const bcParent = {
    name: 'bcParent',
    parentName: null as string,
    url: 'bcParent/:id',
    cursor: '1',
    loading: false
}

function getBcParent() {
    return { ...bcParent }
}

const bcExample = {
    name: 'bcExample',
    parentName: bcParent.name,
    url: 'bcParent/:id/bcExample/:id',
    cursor: '1',
    loading: false
}

function getPendingData() {
    return {
        [bcParent.name]: {
            [bcParent.cursor]: {
                id: bcParent.cursor,
                name: [
                    { id: '300', value: 'XXX-1' },
                    { id: '400', value: 'XXX-2' }
                ]
            }
        }
    }
}

function getData() {
    return {
        [bcParent.name]: [
            {
                vstamp: 0,
                id: bcParent.cursor,
                name: [
                    { id: '300', value: 'XXX-99' },
                    { id: '400', value: 'XXX-2' },
                    { id: '555', value: 'XXX-3' }
                ]
            }
        ]
    }
}
