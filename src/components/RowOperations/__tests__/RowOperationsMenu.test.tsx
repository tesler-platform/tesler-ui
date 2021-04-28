import React from 'react'
import { RowOperationsMenu } from '../RowOperationsMenu'
import { mockStore } from '../../../tests/mockStore'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { WidgetTypes } from '@tesler-ui/schema'
import { WidgetTableMeta } from '../../../interfaces/widget'
import { mount } from 'enzyme'
import { Menu, Skeleton, Icon } from 'antd'
import { RowMeta } from '../../../interfaces/rowMeta'
import { BcMeta } from '../../../interfaces/bc'
import { $do } from '../../../actions/actions'
import { act } from 'react-dom/test-utils'

describe('`<RowOperationsMenu />`', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.bo.bc.bcExample = bcExample
    })

    beforeEach(() => {
        store.getState().view.rowMeta.bcExample = {
            'bcExample/1': rowMeta
        }
        store.getState().view.metaInProgress.bcExample = false
    })

    it('renders empty message', () => {
        store.getState().view.rowMeta.bcExample = null
        const wrapper = mount(
            <Provider store={store}>
                <RowOperationsMenu meta={hierarchyWidget} />
            </Provider>
        )
        expect(wrapper.find(RowOperationsMenu).length).toBe(1)
        expect(wrapper.find(Menu.Item).length).toBe(1)
        expect(wrapper.find(Menu.Item).text()).toBe('No operations available')
    })

    it('renders record operations', () => {
        const wrapper = mount(
            <Provider store={store}>
                <RowOperationsMenu meta={hierarchyWidget} />
            </Provider>
        )
        expect(wrapper.find(RowOperationsMenu).length).toBe(1)
        expect(wrapper.find(Menu.ItemGroup).length).toBe(1)
        expect(wrapper.find(Menu.Item).length).toBe(4)
        expect(wrapper.find(Menu.Item).at(0).text()).toBe('Call the Banners')
        expect(wrapper.find(Menu.Item).at(1).text()).toBe('All of them')
        expect(wrapper.find(Menu.Item).at(2).text()).toBe('Save')
        expect(wrapper.find(Menu.Item).at(3).find(Icon).length).toBe(1)
    })

    it('renders skeleton', () => {
        store.getState().view.metaInProgress.bcExample = true
        const wrapper = mount(
            <Provider store={store}>
                <RowOperationsMenu meta={hierarchyWidget} />
            </Provider>
        )
        expect(wrapper.find(RowOperationsMenu).length).toBe(1)
        expect(wrapper.find(Menu.Item).length).toBe(0)
        expect(wrapper.find(Skeleton).length).toBe(1)
    })

    it('fires `sendOperation` on click', () => {
        const mockDispatch = jest.fn()
        const wrapper = mount(
            <Provider store={{ ...store, dispatch: mockDispatch }}>
                <RowOperationsMenu meta={hierarchyWidget} />
            </Provider>
        )
        expect(mockDispatch).toBeCalledTimes(0)
        act(() => {
            wrapper.find(Menu.Item).at(0).props().onClick({ item: null, key: 'callTheBanners', keyPath: null, domEvent: null })
        })
        wrapper.update()
        expect(mockDispatch).toBeCalledWith(
            expect.objectContaining(
                $do.sendOperation({
                    bcName: 'bcExample',
                    operationType: 'callTheBanners',
                    widgetName: 'widget-example'
                })
            )
        )
    })
})

const bcExample: BcMeta = {
    name: 'bcExample',
    parentName: null,
    url: 'bcExample/:id',
    cursor: '1'
}

const rowMeta: RowMeta = {
    actions: [
        {
            scope: 'record',
            type: 'callTheBanners',
            text: 'Call the Banners'
        },
        {
            scope: 'record',
            type: 'allOfThem',
            text: 'All of them'
        },
        {
            scope: 'bc',
            type: 'create',
            text: 'Create'
        },
        {
            actions: [
                {
                    scope: 'record',
                    type: 'save',
                    text: 'Save'
                },
                {
                    scope: 'record',
                    type: 'delete',
                    text: 'Delete',
                    showOnlyIcon: true,
                    icon: 'remove'
                }
            ],
            text: 'CRUD',
            maxGroupVisualButtonsCount: 2
        }
    ],
    fields: [] as any[]
}

const hierarchyWidget: WidgetTableMeta = {
    bcName: 'bcExample',
    name: 'widget-example',
    type: WidgetTypes.List,
    title: '',
    position: 0,
    gridWidth: 0,
    fields: [],
    options: {
        hierarchy: [
            {
                bcName: 'bcChild',
                fields: []
            }
        ]
    }
}
