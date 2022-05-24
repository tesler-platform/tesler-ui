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

import { Store as CoreStore } from '../../../interfaces/store'
import { concat as observableConcat, of as observableOf, throwError as observableThrowError } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { bcFetchRowMetaRequestCompatibility, bcFetchRowMetaRequest } from '../bcFetchRowMetaRequest'
import { customAction } from '../../../api/api'
import * as api from '../../../api/api'
import { $do, Epic, types } from '../../../actions/actions'
import { ActionsObservable, ofType, StateObservable } from 'redux-observable'
import { WidgetTableMeta, WidgetTypes } from '../../../interfaces/widget'
import { FieldType } from '../../../interfaces/view'
import { testEpic } from '../../../tests/testEpic'
import { RowMeta } from '../../../interfaces/rowMeta'
import { createMockStateObservable } from '../../../tests/createMockStateObservable'

const customActionMock = jest.fn().mockImplementation((...args: Parameters<typeof customAction>) => {
    const [screenName] = args
    if (screenName === 'crash') {
        return observableThrowError('test request crash')
    }
    return observableOf(rowMeta)
})

const consoleMock = jest.fn()

jest.spyOn<any, any>(api, 'fetchRowMeta').mockImplementation(customActionMock)
jest.spyOn(console, 'error').mockImplementation(consoleMock)

describe('bcFetchRowMetaRequest', () => {
    let store$: StateObservable<CoreStore> = null
    const canceler = api.createCanceler()

    beforeAll(() => {
        store$ = createMockStateObservable()
        store$.value.screen.screenName = 'test'
        store$.value.screen.bo.bc.bcExample = bcExample
    })

    afterEach(() => {
        jest.clearAllMocks()
        store$.value.screen.screenName = 'test'
    })

    it('sends API request', () => {
        store$.value.view.widgets[0] = { ...getWidgetMeta() }
        const action = $do.bcFetchRowMeta({
            bcName: 'bcExample',
            widgetName: 'widget-example'
        })
        const epic = bcFetchRowMetaRequest(ActionsObservable.of(action), store$)
        testEpic(epic, res => {
            expect(customActionMock).toBeCalledWith('test', 'bcExample/1', undefined, canceler.cancelToken)
        })
    })

    it('fires `bcFetchRowMetaSuccess` on success', () => {
        store$.value.view.widgets[0] = { ...getWidgetMeta() }
        const action = $do.bcFetchRowMeta({
            bcName: 'bcExample',
            widgetName: 'widget-example'
        })
        testEpic(flow(ActionsObservable.of(action), store$), res => {
            expect(res[0]).toEqual(
                expect.objectContaining(
                    $do.bcFetchRowMetaSuccess({
                        bcName: 'bcExample',
                        rowMeta,
                        bcUrl: 'bcExample/1',
                        cursor: '1'
                    })
                )
            )
        })
    })

    it('fires `bcFetchRowMetaFail` and writes console error on error', () => {
        store$.value.screen.screenName = 'crash'
        store$.value.view.widgets[0] = { ...getWidgetMeta() }
        const action = $do.bcFetchRowMeta({
            bcName: 'bcExample',
            widgetName: 'widget-example'
        })
        testEpic(flow(ActionsObservable.of(action), store$), res => {
            expect(consoleMock).toBeCalledWith('test request crash')
            expect(res[0]).toEqual(
                expect.objectContaining(
                    $do.bcFetchRowMetaFail({
                        bcName: 'bcExample'
                    })
                )
            )
        })
    })

    it.skip('cancels request and fires `bcFetchRowMetaFail` when parent BC fired `bcSelectRecord`', () => {
        /* TODO */
    })
})

const flow: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.bcFetchRowMeta),
        mergeMap(action => observableConcat(...bcFetchRowMetaRequestCompatibility(action, store$, ActionsObservable.of(action))))
    )

function getWidgetMeta(): WidgetTableMeta {
    return {
        name: 'widget-example',
        type: WidgetTypes.List,
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
        ]
    }
}

const bcExample = {
    name: 'bcExample',
    parentName: null as string,
    url: 'bcExample/:id',
    cursor: '1',
    page: 2,
    limit: 5,
    loading: false
}

const rowMeta: RowMeta = {
    actions: [],
    fields: [
        {
            key: 'id',
            currentValue: '19248'
        }
    ]
}
