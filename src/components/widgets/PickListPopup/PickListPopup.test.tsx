import React from 'react'
import { PickListPopup, PickListPopupOwnProps, PickListPopupProps } from './PickListPopup'
import { FieldType } from '../../../interfaces/view'
import { shallow } from 'enzyme'
import { PickMap } from '../../../interfaces/data'
import { WidgetTypes } from '../../../interfaces/widget'
import { Table } from 'antd'
import Pagination from '../../ui/Pagination/Pagination'

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
        rowMetaFields: []
    }
    const actionsProps = {
        onChange: jest.fn(),
        onClose: jest.fn()
    }

    it('should hide "hidden": true fields', () => {
        const wrapper = shallow(<PickListPopup {...props} {...actionsProps} />)
        expect(wrapper.find(Table).length).toEqual(1)
        expect(wrapper.find(Table).props().columns.length).toEqual(1)
    })

    it('should render default title and footer', () => {
        const wrapper = shallow(<PickListPopup {...props} {...actionsProps} showed={true} />)
        expect(shallow(wrapper.props().title.props.children).text()).toEqual(toHideProps.widget.title)
        expect(shallow(wrapper.props().footer).find(Pagination).length).toEqual(1)
    })

    it('should render custom title, table and footer', () => {
        const customTitle = 'custom title'
        const customTableText = 'custom Table'
        const customTable = <p>{customTableText}</p>
        const customFooterText = 'custom Footer'
        const customFooter = <i>{customFooterText}</i>
        const wrapper = shallow(
            <PickListPopup
                {...props}
                {...actionsProps}
                components={{
                    title: customTitle,
                    table: customTable,
                    footer: customFooter
                }}
            />
        )
        expect(wrapper.props().title).toEqual(customTitle)
        expect(wrapper.props().footer).toEqual(customFooter)
        expect(shallow(wrapper.props().children).text()).toEqual(customTableText)
    })
})
