import React from 'react'
import { mount } from 'enzyme'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import { mockStore } from '../../tests/mockStore'
import { Store as CoreStore } from '../../interfaces/store'
import styles from '../ui/Multivalue/MultivalueField.less'
import MultivalueField from './MultivalueField'
import { FieldType } from '../../interfaces/view'
import { MultivalueSingleValue } from '../../interfaces/data'
import { MultivalueFieldMeta } from '../../interfaces/widget'
import { Tag } from 'antd'
import Field from '../Field/Field'
import { buildBcUrl } from '../..'

const testBcName = 'bcExample'
const testPopupBcName = 'testAssoc'

const testCursor = '4'

const testMultivalueData: MultivalueSingleValue[] = [
    { id: '1', value: 'test1', options: {} },
    { id: '2', value: 'test2', options: {} },
    { id: '3', value: 'test3', options: {} }
]

const widgetFieldMeta: MultivalueFieldMeta = {
    label: 'testMultivalue',
    key: 'testMultivalue',
    type: FieldType.multivalue,
    popupBcName: 'testAssoc',
    assocValueKey: 'someUniqueWidgetKey'
}

const fieldProperties = {
    bcName: testBcName,
    cursor: testCursor,
    widgetName: 'name',
    widgetFieldMeta: widgetFieldMeta
}

const assocWidget = {
    id: '1',
    name: 'assocPopup',
    position: 4,
    type: 'AssocListPopup',
    bcName: testPopupBcName,
    title: 'Test Assoc',
    fields: [
        {
            title: 'Number',
            key: 'activeProjectsAmount',
            type: 'input'
        },
        {
            title: 'Name',
            key: 'name',
            type: 'input'
        }
    ],
    gridWidth: 2,
    gridBreak: 0,
    hide: false
}

describe('Multivalue test', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().data[testBcName] = [
            {
                id: testCursor,
                vstamp: 1,
                [widgetFieldMeta.key]: testMultivalueData
            }
        ]
        store.getState().screen.bo.bc[testBcName] = {
            name: testBcName,
            parentName: null,
            cursor: testCursor,
            url: null,
            defaultSort: null
        }
        store.getState().view.rowMeta[testBcName] = {
            [buildBcUrl(testBcName, true)]: {
                actions: [],
                fields: [
                    {
                        key: widgetFieldMeta.key,
                        disabled: false,
                        currentValue: testMultivalueData
                    }
                ]
            }
        }
        store.getState().view.rowMeta[testPopupBcName] = {
            [buildBcUrl(testPopupBcName, true)]: {
                actions: [],
                fields: [
                    {
                        key: '1',
                        disabled: false,
                        currentValue: 'Value'
                    }
                ]
            }
        }
        store.getState().view.widgets = [assocWidget]
    })

    it('component should render field correctly', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Field {...fieldProperties} />
            </Provider>
        )
        const multivalue = wrapper.find(MultivalueField)
        expect(multivalue.find(`.${styles.multivalue}`).length).toBe(1)
        expect(multivalue.find(MultivalueField).length).toBe(1)
    })

    it('component should render tags correctly', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Field {...fieldProperties} />
            </Provider>
        )
        const multivalue = wrapper.find(MultivalueField)
        expect(multivalue.find(Tag).length).toBe(3)
        expect(multivalue.findWhere(x => x.type() === Tag && x.text() === 'test1').length).toBe(1)
        expect(multivalue.findWhere(x => x.type() === Tag && x.text() === 'test2').length).toBe(1)
        expect(multivalue.findWhere(x => x.type() === Tag && x.text() === 'test3').length).toBe(1)
    })

    // TODO: fix this test
    it.skip('component should delete tags', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Field {...fieldProperties} />
            </Provider>
        )
        const field = wrapper.find(Field)
        const multivalue = wrapper.find(MultivalueField)
        console.log(multivalue.props().disabled)
        expect(field.find(Tag).length).toBe(3)
        store.getState().data[testBcName] = []
        field.find(Tag).at(0).props().onClose()
        const dataChangesLength =
            store.getState().view.pendingDataChanges[testBcName] &&
            store.getState().view.pendingDataChanges[testBcName][testCursor] &&
            store.getState().view.pendingDataChanges[testBcName][testCursor][widgetFieldMeta.key]
        expect(dataChangesLength).toHaveLength(2)
        wrapper.update()
        const fieldAfterChanges = wrapper.find(Field)
        expect(fieldAfterChanges.find(Tag).length).toBe(2)
    })

    it('component should change popup state', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Field {...fieldProperties} />
            </Provider>
        )
        const multivalue = wrapper.find(MultivalueField)
        const showPopupIconContainer = multivalue.find(`.${styles.iconContainer}`)
        expect(showPopupIconContainer.length).toBe(1)
        showPopupIconContainer.simulate('click')
        expect(store.getState().view.popupData.bcName).toBe(widgetFieldMeta.popupBcName)
    })
})
