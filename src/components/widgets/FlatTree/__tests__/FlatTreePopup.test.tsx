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

import React from 'react'
import { mount } from 'enzyme'
import { Store } from 'redux'
import * as redux from 'react-redux'
import { Provider } from 'react-redux'
import { ListChildComponentProps } from 'react-window'
import { FlatTreePopup } from '../FlatTreePopup'
import { Store as CoreStore } from '../../../../interfaces/store'
import { WidgetTypes, WidgetTableMeta } from '../../../../interfaces/widget'
import { FieldType } from '../../../../interfaces/view'
import { mockStore } from '../../../../tests/mockStore'
import FlatTree from '../FlatTree'
import { types as coreActions } from '../../../../actions/actions'

const bcExample = {
    name: 'bcExample',
    parentName: 'bcExampleParent',
    url: '',
    cursor: null as string
}

const bcExampleParent = {
    name: 'bcExampleParent',
    parentName: null as string,
    url: '',
    cursor: '99'
}

describe('<FlatTreePopup />', () => {
    let store: Store<CoreStore> = null
    const dispatch = jest.fn()

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.bo.bc.bcExample = bcExample
        store.getState().screen.bo.bc.bcExampleParent = bcExampleParent
        store.getState().view.widgets = [widget]
    })

    beforeEach(() => {
        jest.spyOn(redux, 'useDispatch').mockImplementation(() => {
            return dispatch
        })
    })

    afterEach(() => {
        dispatch.mockClear()
        jest.resetAllMocks()
        store.getState().view.pickMap = null
    })

    it('renders PickListPopup with <FlatTree /> content', () => {
        const wrapper = mount(
            <Provider store={store}>
                <FlatTreePopup meta={widget} />
            </Provider>
        )
        expect(wrapper.find(FlatTree).length).toBe(1)
    })

    it('passes custom component as children to nested FlatTree implementation', () => {
        const CustomComponent: React.FC<ListChildComponentProps> = props => {
            return <div>I'm custom</div>
        }
        const wrapper = mount(
            <Provider store={store}>
                <FlatTreePopup meta={widget}>{CustomComponent}</FlatTreePopup>
            </Provider>
        )
        expect(wrapper.find(FlatTree).props().children).toBe(CustomComponent)
    })

    it('does nothing on selecting an item when no pickMap in the store', () => {
        const wrapper = mount(
            <Provider store={store}>
                <FlatTreePopup meta={widget} />
            </Provider>
        )
        ;(wrapper.find(FlatTree).props().onSelect as (item: any) => void)({ id: 'test', name: 'Test', vstamp: 0 })
        expect(dispatch).toHaveBeenCalledTimes(0)
    })

    it('dispatches action chain when selecting an item', () => {
        store.getState().view.pickMap = {
            linkId: 'id',
            linkName: 'name'
        }
        const wrapper = mount(
            <Provider store={store}>
                <FlatTreePopup meta={widget} />
            </Provider>
        )
        ;(wrapper.find(FlatTree).props().onSelect as (item: any) => void)({ id: 'test', name: 'Test', vstamp: 0 })
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: coreActions.changeDataItem,
                payload: {
                    bcName: bcExampleParent.name,
                    cursor: bcExampleParent.cursor,
                    dataItem: {
                        linkId: 'test',
                        linkName: 'Test'
                    }
                }
            })
        )
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: coreActions.viewClearPickMap,
                payload: null
            })
        )
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: coreActions.closeViewPopup,
                payload: null
            })
        )
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: coreActions.bcRemoveAllFilters,
                payload: {
                    bcName: bcExample.name
                }
            })
        )
    })
})

const widget: WidgetTableMeta = {
    name: 'widget-example',
    type: WidgetTypes.FlatTreePopup,
    title: null,
    bcName: 'bcExample',
    position: 1,
    gridWidth: null,
    fields: [
        {
            key: 'field-example',
            title: 'Test Column',
            type: FieldType.input
        }
    ]
}
