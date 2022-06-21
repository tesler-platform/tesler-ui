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

import { Store as CoreStore } from '../../../interfaces/store'
import { WidgetTableMeta, WidgetTypes, WidgetTableHierarchy } from '../../../interfaces/widget'
import { FieldType } from '../../../interfaces/view'
import { removeMultivalueTag } from '../removeMultivalueTag'
import { $do, types as coreActions } from '../../../actions/actions'
import { StateObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'
import { of as observableOf } from 'rxjs'

describe('removeMultivalueTag for full hierarchies', () => {
    let store$: StateObservable<CoreStore> = null

    beforeAll(() => {
        store$ = createMockStateObservable()
        store$.value.screen.bo.bc.bcExample = bcExample
        store$.value.data.bcExample = [{ id: '1', name: 'one', vstamp: 0 }]
        store$.value.data.bcExamplePopup = [{ id: '9', name: 'one', vstamp: 0, _associate: true }]
        store$.value.view.widgets = [getWidgetMeta()]
    })

    afterEach(() => {
        store$.value.screen.bo.bc.bcExample = bcExample
        store$.value.view.widgets = [getWidgetMeta()]
    })

    it('sets a new value for field bc', () => {
        const action = $do.removeMultivalueTag({
            bcName: 'bcExample',
            popupBcName: 'bcExamplePopup',
            cursor: '1',
            associateFieldKey: 'exampleField',
            dataItem: [],
            removedItem: { id: '9', value: 'remove item' }
        })
        const epic = removeMultivalueTag(observableOf(action), store$)

        testEpic(epic, result => {
            expect(result.length).toBe(1)
            expect(result[0]).toEqual(
                expect.objectContaining({
                    type: coreActions.changeDataItem,
                    payload: {
                        bcName: 'bcExample',
                        cursor: '1',
                        dataItem: { exampleField: action.payload.dataItem }
                    }
                })
            )
        })
    })

    it('removes every associated children when `hierarchyGroupDeselection` enabled', () => {
        store$.value.view.widgets[0].options.hierarchyGroupDeselection = true
        store$.value.data.bcExamplePopup = getData()
        store$.value.view.pendingDataChanges.bcExamplePopup = {
            '932': { _associate: true, name: 'one three two' }
        }
        const removedItem = { id: '9', value: 'one' }
        const dataItem = getSelectedItems().filter(item => item.id !== removedItem.id)
        const action = $do.removeMultivalueTag({
            bcName: 'bcExample',
            popupBcName: 'bcExamplePopup',
            cursor: '1',
            associateFieldKey: 'exampleField',
            dataItem,
            removedItem
        })
        const epic = removeMultivalueTag(observableOf(action), store$)
        testEpic(epic, result => {
            expect(result[0]).toEqual(
                expect.objectContaining({
                    type: coreActions.changeDataItem,
                    payload: {
                        bcName: 'bcExample',
                        cursor: '1',
                        dataItem: {
                            exampleField: [
                                { id: '1', value: 'root' },
                                { id: '8', value: 'two' },
                                { id: '921', value: 'one two one' },
                                { id: '931', value: 'one three one' },
                                { id: '932', value: 'one three two' }
                            ]
                        }
                    }
                })
            )
        })
    })

    it('removes every associated descendant when `hierarchyGroupDeselection` and `hierarchyTraverse` enabled', () => {
        store$.value.view.widgets[0].options.hierarchyGroupDeselection = true
        store$.value.view.widgets[0].options.hierarchyTraverse = true
        store$.value.data.bcExamplePopup = getData()
        store$.value.view.pendingDataChanges.bcExamplePopup = {
            '932': { _associate: true, name: 'one three two' }
        }
        const removedItem = { id: '9', value: 'one' }
        const dataItem = getSelectedItems().filter(item => item.id !== removedItem.id)
        const action = $do.removeMultivalueTag({
            bcName: 'bcExample',
            popupBcName: 'bcExamplePopup',
            cursor: '1',
            associateFieldKey: 'exampleField',
            dataItem,
            removedItem
        })
        const epic = removeMultivalueTag(observableOf(action), store$)
        testEpic(epic, result => {
            expect(result[0]).toEqual(
                expect.objectContaining({
                    type: coreActions.changeDataItem,
                    payload: {
                        bcName: 'bcExample',
                        cursor: '1',
                        dataItem: {
                            exampleField: [
                                { id: '1', value: 'root' },
                                { id: '8', value: 'two' }
                            ]
                        }
                    }
                })
            )
        })
    })

    it('removes parent node if removed last child when `hierarchyGroupDeselection` enabled', () => {
        store$.value.view.widgets[0].options.hierarchyGroupDeselection = true
        store$.value.data.bcExamplePopup = getData()
        store$.value.view.pendingDataChanges.bcExamplePopup = {
            '932': { _associate: true, name: 'one three two' }
        }
        const removedItem = { id: '921', value: 'one' }
        const dataItem = getSelectedItems().filter(item => item.id !== removedItem.id)
        const action = $do.removeMultivalueTag({
            bcName: 'bcExample',
            popupBcName: 'bcExamplePopup',
            cursor: '1',
            associateFieldKey: 'exampleField',
            dataItem,
            removedItem
        })
        const epic = removeMultivalueTag(observableOf(action), store$)
        testEpic(epic, result => {
            expect(result[0]).toEqual(
                expect.objectContaining({
                    type: coreActions.changeDataItem,
                    payload: {
                        bcName: 'bcExample',
                        cursor: '1',
                        dataItem: {
                            exampleField: [
                                { id: '1', value: 'root' },
                                { id: '8', value: 'two' },
                                { id: '9', value: 'one' },
                                { id: '931', value: 'one three one' },
                                { id: '932', value: 'one three two' },
                                { id: '94', value: 'one four' }
                            ]
                        }
                    }
                })
            )
        })
    })

    it('removes parent node if removed last descendant when `hierarchyGroupDeselection` and `hierarchyTraverse` enabled', () => {
        store$.value.view.widgets[0].options.hierarchyGroupDeselection = true
        store$.value.view.widgets[0].options.hierarchyTraverse = true
        store$.value.data.bcExamplePopup = getData().map(item => ({ ...item, _associate: ['1', '9'].includes(item.id) }))
        store$.value.view.pendingDataChanges.bcExamplePopup = {
            '932': { _associate: true, name: 'one three two' }
        }
        const removedItem = { id: '932', value: 'one three two' }
        const dataItem = getSelectedItems().filter(item => ['1', '8', '9', '932'].includes(item.id))
        const action = $do.removeMultivalueTag({
            bcName: 'bcExample',
            popupBcName: 'bcExamplePopup',
            cursor: '1',
            associateFieldKey: 'exampleField',
            dataItem,
            removedItem
        })
        const epic = removeMultivalueTag(observableOf(action), store$)
        testEpic(epic, result => {
            expect(result[0]).toEqual(
                expect.objectContaining({
                    type: coreActions.removeMultivalueTag,
                    payload: {
                        ...action.payload,
                        removedItem: { id: '93', value: null }
                    }
                })
            )
        })
    })

    it('fires two `changeDataItem` for non-full hierarchies', () => {
        store$.value.view.widgets[0].options = { hierarchyFull: false, hierarchy: separateHierarchy }
        const action = $do.removeMultivalueTag({
            bcName: 'bcExample',
            popupBcName: 'bcExamplePopup',
            cursor: '1',
            associateFieldKey: 'exampleField',
            dataItem: [],
            removedItem: { id: '999', value: 'remove item' }
        })
        store$.value.view.pendingDataChanges.bcExamplePopup = {
            '888': { _associate: true, name: 'one three two' }
        }
        store$.value.view.pendingDataChanges.bcExamplePopup2 = {
            '999': { _associate: true, name: 'one three two' }
        }
        const epic = removeMultivalueTag(observableOf(action), store$)

        testEpic(epic, result => {
            expect(result.length).toBe(2)
            const [self, parent] = result
            expect(self).toEqual(
                expect.objectContaining({
                    type: coreActions.changeDataItem,
                    payload: {
                        bcName: 'bcExamplePopup2',
                        cursor: '999',
                        dataItem: { _associate: false, id: '999', value: 'remove item' }
                    }
                })
            )
            expect(parent).toEqual(
                expect.objectContaining({
                    type: coreActions.changeDataItem,
                    payload: {
                        bcName: 'bcExample',
                        cursor: '1',
                        dataItem: { exampleField: action.payload.dataItem }
                    }
                })
            )
        })
    })

    it('removes associated item for non-hierarchies', () => {
        store$.value.data.bcExamplePopup = getData()
        store$.value.view.widgets[0].options = {
            hierarchyFull: false,
            hierarchy: undefined,
            hierarchySameBc: false
        }
        store$.value.view.pendingDataChanges.bcExamplePopup = {
            '932': { _associate: true, name: 'one three two' }
        }
        const removedItem = { id: '921', value: 'one' }
        const dataItem = getSelectedItems().filter(item => item.id !== removedItem.id)
        const action = $do.removeMultivalueTag({
            bcName: 'bcExample',
            popupBcName: 'bcExamplePopup',
            cursor: '1',
            associateFieldKey: 'exampleField',
            dataItem,
            removedItem
        })
        const epic = removeMultivalueTag(observableOf(action), store$)
        testEpic(epic, result => {
            expect(result[0]).toEqual(
                expect.objectContaining({
                    type: coreActions.changeDataItem,
                    payload: {
                        bcName: 'bcExamplePopup',
                        cursor: '921',
                        dataItem: { _associate: false, id: '921', value: 'one' }
                    }
                })
            )
        })
    })
})

function getWidgetMeta(): WidgetTableMeta {
    return {
        name: 'widget-example',
        type: WidgetTypes.AssocListPopup,
        title: null,
        bcName: 'bcExamplePopup',
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

const bcExample = {
    name: 'bcExample',
    parentName: null as string,
    url: '',
    cursor: null as string,
    loading: false
}

/**
 * Full hierarchy data from the store
 */
function getData() {
    return [
        { id: '1', parentId: '0', name: 'root', vstamp: 0, _associate: true },
        { id: '8', parentId: '1', name: 'two', vstamp: 0, _associate: true },
        { id: '9', parentId: '1', name: 'one', vstamp: 0, _associate: true },
        { id: '91', parentId: '9', name: 'one one', vstamp: 0, _associate: false },
        { id: '92', parentId: '9', name: 'one two', vstamp: 0, _associate: true },
        { id: '921', parentId: '92', name: 'one two one', vstamp: 0, _associate: true },
        { id: '93', parentId: '9', name: 'one three', vstamp: 0, _associate: false },
        { id: '931', parentId: '93', name: 'one three one', vstamp: 0, _associate: true },
        { id: '932', parentId: '93', name: 'one three two', vstamp: 0, _associate: false }, // overrided
        { id: '94', parentId: '9', name: 'one four', vstamp: 0, _associate: true }
    ]
}

/**
 * Currently selected items displayed by MultivalueTag
 */
function getSelectedItems() {
    return [
        { id: '1', value: 'root' },
        { id: '8', value: 'two' },
        { id: '9', value: 'one' },
        { id: '92', value: 'one two' },
        { id: '921', value: 'one two one' },
        { id: '931', value: 'one three one' },
        { id: '932', value: 'one three two' }, // from pendingChanges
        { id: '94', value: 'one four' }
    ]
}

/**
 * Configuration for widget where each level of hierarchy represented by different
 * business component
 */
const separateHierarchy: WidgetTableHierarchy[] = [
    { bcName: 'bcExamplePopup1', fields: [{ type: FieldType.input, title: 'name', key: 'name' }] },
    { bcName: 'bcExamplePopup2', fields: [{ type: FieldType.input, title: 'name', key: 'name' }] }
]
