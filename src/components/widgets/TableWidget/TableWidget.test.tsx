import React, {ReactElement} from 'react'
import {mount} from 'enzyme'
import {TableWidget, TableWidgetProps} from './TableWidget'
import {WidgetTableMeta, WidgetTypes} from 'interfaces/widget'
import {FieldType} from 'interfaces/view'
import {DataItem} from 'interfaces/data'
import {RowMetaField} from 'interfaces/rowMeta'
import {BcFilter, FilterGroup} from 'interfaces/filters'
import {RouteType} from 'interfaces/router'
import {Table} from 'antd'
import {Store} from 'redux'
import {Store as CoreStore} from '../../../interfaces/store'
import {mockStore} from '../../../tests/mockStore'
import * as redux from 'react-redux'
import {Provider} from 'react-redux'

describe('TableWidget test', () => {
    let store: Store<CoreStore> = null
    const dispatch = jest.fn()

    beforeAll(() => {
        store = mockStore()
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

    const hideFieldProps: WidgetTableMeta = {
        name: 'widgetName',
        title: 'wTitle',
        type: WidgetTypes.List,
        position: 1,
        bcName: 'bcName',
        gridWidth: 12,
        fields: [
            {
                title: 'for hide',
                key: 'a',
                type: FieldType.multivalue,
                hidden: true
            },
            {
                title: '#',
                key: 'number',
                type: FieldType.input
            },
        ],

    }
    const restProps: TableWidgetProps = {
        meta: {...hideFieldProps},
        data: [] as DataItem[],
        rowMetaFields: [] as RowMetaField[],
        limitBySelf: false,
        bcName: 'bcName',
        route: {
            type: RouteType.screen,
            path: '',
            params: {}
        },
        cursor: '',
        selectedCell: {
            widgetName: 'a',
            rowId: 'q',
            fieldKey: 'a'
        },
        pendingDataItem: {},
        hasNext: false,
        operations: [],
        metaInProgress: false,
        filters: [] as BcFilter[],
        filterGroups: [] as FilterGroup[],
        onDrillDown: jest.fn(),
        onShowAll: jest.fn(),
        onOperationClick: jest.fn(),
        onSelectRow: jest.fn(),
        onSelectCell: jest.fn(),
        onRemoveFilters: jest.fn(),
        onApplyFilter: jest.fn(),
        onForceUpdate: jest.fn(),
    }

    it('should hide "hidden": true fields', () => {
        const wrapper = mount(
            <Provider store={store}>
                <TableWidget
                    {...restProps}
                    meta={{...hideFieldProps}}
                />
            </Provider>)
        expect(wrapper.find(Table).length).toEqual(1)
        expect(wrapper.find(Table).props().columns.length).toEqual(1)
    })

    it('should render custom column title', () => {
        const customTitleText = 'Some title'
        const wrapper1 = mount(
            <Provider store={store}>
                <TableWidget
                    {...restProps}
                    meta={{...hideFieldProps}}
                />
            </Provider>)
        const wrapper = mount(
            <Provider store={store}>
                <TableWidget
                    {...restProps}
                    meta={{...hideFieldProps}}
                    columnTitleComponent={() => <div>{customTitleText}</div>}
                />
            </Provider>)
        expect(wrapper.find(Table).props().columns.findIndex(i => (i.title as ReactElement).props.children === customTitleText)).toEqual(0)
        expect(wrapper1.find(Table).props().columns.findIndex(
            i => (i.title as ReactElement).props.widgetName === hideFieldProps.name
            )).toEqual(0)
    })
})
