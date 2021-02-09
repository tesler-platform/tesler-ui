/*
 * TESLER-UI
 * Copyright (C) 2018-2021 Tesler Contributors
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

import { DataItem } from '@tesler-ui/schema'
import { $do } from '../../actions/actions'
import { data } from '../data'

describe('data reducer', () => {
    it('it sets new from payload on `bcFetchDataSuccess` except for hierarchies ', () => {
        const state = {}
        const item = { id: '9', vstamp: -1 }
        const nextState = data(
            state,
            $do.bcFetchDataSuccess({
                bcName: 'bcExample',
                data: [item],
                bcUrl: 'bcExample'
            })
        )
        expect(nextState.bcExample).toEqual(expect.arrayContaining([item]))
        const hierarchyNextState = data(
            state,
            $do.bcFetchDataSuccess({
                bcName: 'bcExample',
                data: [item],
                bcUrl: 'bcExample',
                depth: 2
            })
        )
        expect(hierarchyNextState.bcExample).toBe(undefined)
    })

    it('puts new record in the store for specified business component on `bcNewDataSuccess` action', () => {
        const existingDataItem = { id: '8', vstamp: -1 }
        const dataItem = { id: '9', vstamp: -1 }
        const state = { bcExampleExisting: [existingDataItem] }
        let newState = data(state, $do.bcNewDataSuccess({ bcName: 'bcExampleExisting', bcUrl: 'test', dataItem }))
        expect(newState.bcExampleExisting).toEqual(expect.arrayContaining([existingDataItem, dataItem]))
        newState = data(state, $do.bcNewDataSuccess({ bcName: 'bcExampleNew', bcUrl: 'test', dataItem }))
        expect(newState.bcExampleNew).toEqual(expect.arrayContaining([dataItem]))
    })

    it('updates existing item on `bcSaveDataSuccess` action', () => {
        const dataItem1 = { id: '8', vstamp: -1 }
        const dataItem2 = { id: '9', vstamp: -1 }
        const state = { bcExample: [dataItem1, dataItem2], anotherBc: [dataItem2] }
        let newState = data(
            state,
            $do.bcSaveDataSuccess({
                bcName: 'bcExample',
                cursor: '9',
                dataItem: { id: '9', vstamp: 0 }
            })
        )
        expect(newState.bcExample).toEqual(expect.arrayContaining([dataItem1, { id: '9', vstamp: 0 }]))
        expect(newState.anotherBc).toEqual(expect.arrayContaining([dataItem2]))
        newState = data(
            state,
            $do.bcSaveDataSuccess({
                bcName: 'YetAnotherBc',
                cursor: '9',
                dataItem: { id: '9', vstamp: 0 }
            })
        )
        /**
         * TODO: Strange behavior; apparently it will not save for non-existing BC
         *
         * Probably related to race condition when trying to save something after navigating to another screen or logging out
         */
        expect(newState.YetAnotherBc.length).toBe(0)
    })

    it('sets items for pseudo-BC with `Delta` suffix on `changeAssociations` action', () => {
        const dataItem = { id: '9', vstamp: -1, _associate: true }
        const nextState = data(
            {},
            $do.changeAssociations({
                bcName: 'bcExample',
                records: [dataItem]
            })
        )
        expect(nextState.bcExampleDelta).toEqual(expect.arrayContaining([dataItem]))
    })

    it('clears the state for `selectView` action', () => {
        const state = {
            bcExample: [{ id: '9', vstamp: -1 }]
        }
        const nextState = data(state, $do.selectView({ name: 'test', url: 'test', widgets: [] }))
        expect(Object.keys(nextState).length).toBe(0)
    })
})

describe('`bcFetchRowMetaSuccess` action', () => {
    let state: Record<string, DataItem[]>

    beforeEach(() => {
        state = {
            bcExample: [{ id: '9', vstamp: -1, name: 'Jesse Heinig' }]
        }
    })

    it('returns previous state if there is no cursor in payload', () => {
        const newState = data(
            state,
            $do.bcFetchRowMetaSuccess({
                bcName: 'bcExample',
                bcUrl: 'bcExample',
                rowMeta: { actions: [], fields: [{ key: 'name', currentValue: 'Jason Taylor' }] }
            })
        )
        expect(newState.bcExample).toEqual(state.bcExample)
    })

    it('returns previous state if rowmeta id is null', () => {
        const newState = data(
            state,
            $do.bcFetchRowMetaSuccess({
                bcName: 'bcExample',
                bcUrl: 'bcExample',
                cursor: '9',
                rowMeta: {
                    actions: [],
                    fields: [
                        { key: 'id', currentValue: null },
                        { key: 'name', currentValue: 'Jason Taylor' }
                    ]
                }
            })
        )
        expect(newState.bcExample).toEqual(state.bcExample)
    })

    it('puts new record in the store for specified BC if previously there was no record with this id', () => {
        let newState = data(
            state,
            $do.bcFetchRowMetaSuccess({
                bcName: 'bcExample',
                bcUrl: 'bcExample',
                cursor: '8',
                rowMeta: {
                    actions: [],
                    fields: [
                        { key: 'id', currentValue: '8' },
                        { key: 'name', currentValue: 'Robert Hertenstein' }
                    ]
                }
            })
        )

        expect(newState.bcExample).toEqual(
            expect.arrayContaining([
                { id: '9', vstamp: -1, name: 'Jesse Heinig' },
                { id: '8', vstamp: -1, _associate: undefined, name: 'Robert Hertenstein' }
            ])
        )

        newState = data(
            state,
            $do.bcFetchRowMetaSuccess({
                bcName: 'anotherBc',
                bcUrl: 'anotherBc',
                cursor: '8',
                rowMeta: {
                    actions: [],
                    fields: [
                        { key: 'id', currentValue: '8' },
                        { key: 'name', currentValue: 'Nick Kesting' }
                    ]
                }
            })
        )

        expect(newState.anotherBc).toEqual(expect.arrayContaining([{ id: '8', vstamp: -1, _associate: undefined, name: 'Nick Kesting' }]))
    })

    it('updated records field based on `currentValue` in rowMeta', () => {
        state = {
            bcExample: [
                { id: '9', vstamp: -1, name: 'Jesse Heinig' },
                { id: '8', vstamp: -1, name: 'Chris Jones' }
            ]
        }
        const newState = data(
            state,
            $do.bcFetchRowMetaSuccess({
                bcName: 'bcExample',
                bcUrl: 'bcExample',
                cursor: '9',
                rowMeta: {
                    actions: [],
                    fields: [
                        { key: 'id', currentValue: '9' },
                        { key: 'name', currentValue: 'Jesse Reynolds' }
                    ]
                }
            })
        )
        expect(newState.bcExample[0].name).toBe('Jesse Reynolds')
        expect(newState.bcExample[1].name).toBe('Chris Jones')
    })
})
