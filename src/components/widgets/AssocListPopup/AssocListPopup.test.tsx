import React from 'react'
import { AssocListPopup, IAssocListActions, IAssocListProps } from './AssocListPopup'
import { WidgetTypes } from '../../../interfaces/widget'
import { FieldType } from '../../../interfaces/view'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import * as redux from 'react-redux'
import { mount } from 'enzyme'
import { Modal } from 'antd'

describe('AssocListPopup test', () => {
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
        onRemoveFilter: jest.fn(),
        onDeleteTag: jest.fn(),
        onCancel: jest.fn(),
        onClose: jest.fn(),
        onDeleteAssociations: jest.fn()
    }

    it('should render default title, table and footer', () => {
        const wrapper = mount(
            <Provider store={store}>
                <AssocListPopup {...defProps} {...actionProps} />
            </Provider>
        )
        expect(wrapper.find(AssocListPopup).props().widget.title).toEqual(defProps.widget.title)
        expect(wrapper.find(AssocListPopup).props().footer).toEqual(undefined)
        expect(wrapper.find('Connect(AssocTable)').length).toEqual(1)
    })

    it('should render custom title, table and footer', () => {
        const customTitle = 'custom title'
        const customTableText = 'custom Table'
        const customTable = <p>{customTableText}</p>
        const customFooterText = 'custom Footer'
        const customFooter = <i>{customFooterText}</i>
        const wrapper = mount(
            <Provider store={store}>
                <AssocListPopup
                    {...defProps}
                    {...actionProps}
                    components={{
                        title: customTitle,
                        table: customTable,
                        footer: customFooter
                    }}
                />
            </Provider>
        )
        expect(wrapper.find(AssocListPopup).children().props().title).toEqual(customTitle)
        expect(wrapper.find(Modal).props().footer).toEqual(customFooter)
        expect(wrapper.find('p').children().text()).toBe(customTableText)
    })
})
