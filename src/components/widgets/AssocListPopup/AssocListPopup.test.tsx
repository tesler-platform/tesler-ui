import React from 'react'
import {AssocListPopup, IAssocListActions, IAssocListProps} from './AssocListPopup'
import {WidgetTypes} from 'interfaces/widget'
import {FieldType} from 'interfaces/view'
import {shallow} from 'enzyme'

describe('AssocListPopup test', () => {
    const defProps: IAssocListProps = {
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
        },
        showed: true,
        assocValueKey: 'assocValueKey',
        associateFieldKey: 'associateFieldKey',
        bcLoading: false,
        pendingDataChanges: {},
        isFilter: false,
        calleeBCName: 'calleeBCName'
    }
    const actionProps: IAssocListActions = {
        onSave: jest.fn(),
        onFilter: jest.fn(),
        onDeleteTag: jest.fn(),
        onCancel: jest.fn(),
        onClose: jest.fn(),
    }

    it('should render default title, table and footer', () => {
        const wrapper = shallow(<AssocListPopup {...defProps} {...actionProps}/>)
        expect(wrapper.props().title).toEqual(defProps.widget.title)
        expect(wrapper.props().footer).toEqual(undefined)
        expect(wrapper.find('Connect(AssocTable)').length).toEqual(1)
    })

    it('should render custom title, table and footer', () => {
        const customTitle = 'custom title'
        const customTableText = 'custom Table'
        const customTable = <p>{customTableText}</p>
        const customFooterText = 'custom Footer'
        const customFooter = <i>{customFooterText}</i>
        const wrapper = shallow(<AssocListPopup
            {...defProps}
            {...actionProps}
            components={{
                title: customTitle,
                table: customTable,
                footer: customFooter
            }}
        />)
        expect(wrapper.props().title).toEqual(customTitle)
        expect(wrapper.props().footer).toEqual(customFooter)
        expect(shallow(wrapper.props().children).text()).toEqual(customTableText)
    })
})
