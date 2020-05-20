import React from 'react'
import {shallow} from 'enzyme'
import {Table} from 'antd'
import {FullHierarchyTable, FullHierarchyTableAllProps, FullHierarchyTableOwnProps} from './FullHierarchyTable'
import {WidgetTypes} from 'interfaces/widget'
import {FieldType} from 'interfaces/view'
import {AssociatedItem} from 'interfaces/operation'
import {BcFilter, FilterType} from '../../interfaces/filters'


describe('FullHierarchyTable test', () => {
    const toHideOwnProps: FullHierarchyTableOwnProps = {
        meta: {
            name: 'UserPopup',
            title: 'Users',
            type: WidgetTypes.DataGrid as WidgetTypes.List | WidgetTypes.DataGrid,
            position: 1,
            bcName: 'bcName',
            gridWidth: 12,
            fields: [
                {
                    title: 'First name',
                    key: 'firstName',
                    type: FieldType.input,
                    hidden: true
                },
                {
                    title: 'Last name',
                    key: 'lastName',
                    type: FieldType.input
                }
            ]
        }
    }
    const props: FullHierarchyTableAllProps = {
        meta: toHideOwnProps.meta,
        data: [] as AssociatedItem[],
        loading: false,
        pendingChanges: {},
        bcFilters: [],
        rowMetaFields: [],
        onSelect: jest.fn(),
        onDeselectAll: jest.fn(),
        onSelectAll: jest.fn(),
        onSelectFullTable: jest.fn(),
        addFilter: jest.fn(),
        removeFilter: jest.fn(),
    }

    it('should hide "hidden": true fields', () => {
        const wrapper = shallow(<FullHierarchyTable {...props}/>)
        expect(wrapper.find(Table).length).toEqual(1)
        expect(wrapper.find(Table).props().columns
        .find(i => i.key === props.meta.fields[0].key)).toEqual(undefined)

    })
})

describe('FullHierarchyTable test', () => {
    const toHideOwnProps: FullHierarchyTableOwnProps = {
        selectable: true,
        depth: 1,
        parentId: '0',
        assocValueKey: 'name',
        searchPlaceholder: 'input value',
        meta: {
            name: 'HierarcyPopup',
            title: 'FullHierarhy',
            type: WidgetTypes.DataGrid as WidgetTypes.List | WidgetTypes.DataGrid,
            position: 1,
            bcName: 'bcName',
            gridWidth: 12,
            fields: [
                {
                    title: 'Name',
                    key: 'name',
                    type: FieldType.input
                },
                {
                    title: 'Description',
                    key: 'desc',
                    type: FieldType.input
                }
            ]
        }
    }
    const dataItems: AssociatedItem[] = [
        {
            _associate: true,
            id: '1',
            vstamp: 1,
            parentId: '0',
            depth: 1,
            ['name']: 'first name',
            ['desc']: 'first description'
        },
        {
            _associate: true,
            id: '2',
            vstamp: 1,
            parentId: '0',
            depth: 1,
            ['name']: 'second name',
            ['desc']: 'second description'
        },
        {
            _associate: true,
            id: '3',
            vstamp: 1,
            parentId: '1',
            depth: 2,
            ['name']: 'third name',
            ['desc']: 'third description'
        }
    ]
    const prefilters: BcFilter[] = [
        {
            type: FilterType.contains,
            fieldName: 'desc',
            value: ['description']
        }
    ]
    const props: FullHierarchyTableAllProps = {
        meta: toHideOwnProps.meta,
        data: dataItems as AssociatedItem[],
        loading: false,
        pendingChanges: {},
        bcFilters: prefilters,
        rowMetaFields: [{currentValue: '11111',key: 'desc'}],
        onSelect: jest.fn(),
        onDeselectAll: jest.fn(),
        onSelectAll: jest.fn(),
        onSelectFullTable: jest.fn(),
        addFilter: jest.fn(),
        removeFilter: jest.fn(),
    }

    it('filter operation column with test data', () => {
        const wrapper = shallow(<FullHierarchyTable {...props}/>)
        expect(wrapper.find(Table).length).toEqual(1)
        expect(wrapper.find(Table).props().columns
            .find(i => i.key === props.meta.fields[0].key))
        expect(wrapper.find(Table).contains('third description'))


    })
})
