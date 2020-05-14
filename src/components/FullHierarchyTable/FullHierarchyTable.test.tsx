import React from 'react'
import {shallow} from 'enzyme'
import {Table} from 'antd'
import {FullHierarchyTable, FullHierarchyTableAllProps, FullHierarchyTableOwnProps} from './FullHierarchyTable'
import {WidgetTypes} from 'interfaces/widget'
import {FieldType} from 'interfaces/view'
import {AssociatedItem} from 'interfaces/operation'


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
        onSelect: jest.fn(),
        onDeselectAll: jest.fn(),
        onSelectAll: jest.fn(),
    }

    it('should hide "hidden": true fields', () => {
        const wrapper = shallow(<FullHierarchyTable {...props}/>)
        expect(wrapper.find(Table).length).toEqual(1)
        expect(wrapper.find(Table).props().columns
        .find(i => i.key === props.meta.fields[0].key)).toEqual(undefined)

    })
})
