import React from 'react'
import {PickListPopup, PickListPopupOwnProps, PickListPopupProps} from './PickListPopup'
import {FieldType} from 'interfaces/view'
import {shallow} from 'enzyme'
import {PickMap} from 'interfaces/data'
import {WidgetTypes} from 'interfaces/widget'
import {Table} from 'antd'

describe('PickListPopup test', () => {
    const toHideProps: PickListPopupOwnProps = {
        widget: {
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
    const props: PickListPopupProps = {
        widget: toHideProps.widget,
        data: [],
        showed: true,
        pickMap: {} as PickMap,
        cursor: '',
        parentBCName: '',
        bcLoading: false,
        rowMetaFields: [],
    }
    const actionsProps = {
        onChange: jest.fn(),
        onClose: jest.fn(),
    }

    it('should hide "hidden": true fields', () => {
        const wrapper = shallow(<PickListPopup {...props} {...actionsProps}/>)
        expect(wrapper.find(Table).length).toEqual(1)
        expect(wrapper.find(Table).props().columns.length).toEqual(1)

    })
})
