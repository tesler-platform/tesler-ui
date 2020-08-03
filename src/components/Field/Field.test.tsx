import React from 'react'
import {mount} from 'enzyme'
import {Store} from 'redux'
import {Provider} from 'react-redux'
import {mockStore} from '../../tests/mockStore'
import {WidgetField, WidgetTypes} from '../../interfaces/widget'
import {Store as CoreStore} from '../../interfaces/store'
import {FieldType} from '../../interfaces/view'
import Field from './Field'
import ActionLink from '../ui/ActionLink/ActionLink'
import ReadOnlyField from '../ui/ReadOnlyField/ReadOnlyField'

const testBcName = 'bcExample'
const initialCursor = '1001'

describe('Readonly field drilldown', () => {
    let store: Store<CoreStore> = null

    const fieldName = 'fieldName'
    const drillDownCursor = '1002'

    const fieldMeta: WidgetField = {
        key: 'someInput',
        label: fieldName,
        type: FieldType.input,
        drillDown: true
    }

    const fieldProperties = {
        bcName: testBcName,
        cursor: drillDownCursor,
        widgetName: 'name',
        widgetFieldMeta: fieldMeta,
        readonly: true
    }

    beforeAll(() => {
        store = mockStore()
        store.getState().data = {
            [testBcName]: [{id: drillDownCursor, vstamp: 1}]
        }
    })

    beforeEach(() => {
        store.getState().screen.bo.bc[testBcName] = {
            name: testBcName,
            parentName: null,
            url: testBcName,
            defaultSort: null,
            cursor: initialCursor
        }
    })

    // TODO: check drilldowns, broken test
    it.skip('is rendered and do action on click', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...fieldProperties}
                />
            </Provider>
        )

        expect(wrapper.find(Field).length).toBe(1)
        const link = wrapper.find(ActionLink)
        expect(link.length).toBe(1)
        link.simulate('click')
        expect(store.getState().screen.bo.bc[testBcName].cursor).toBe(drillDownCursor)
    })

    it('behaviour can be supressed', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...fieldProperties}
                    disableDrillDown
                />
            </Provider>
        )

        expect(wrapper.find(Field).length).toBe(1)
        expect(wrapper.find(ActionLink).length).toBe(0)
        const roField = wrapper.find(ReadOnlyField)
        expect(roField.length).toBe(1)
        roField.simulate('click')
        expect(store.getState().screen.bo.bc[testBcName].cursor).toBe(initialCursor)
    })

    it('should render render tooltip in custom position', () => {
        store.getState().view.pendingValidationFails = {
            [fieldMeta.key]: 'error'
        }
        store.getState().view.widgets = [{
            name: 'test',
            type: WidgetTypes.List,
            title: '',
            bcName: testBcName,
            position: 1,
            gridWidth: 2,
            fields: [fieldMeta],
        }]
        const wrapper = mount(<Provider store={store}>
            <Field
                {...fieldProperties}
                tooltipPlacement="right"
                readonly={false}
            />
        </Provider>)
        expect(wrapper.find('Tooltip').findWhere(i => i.prop('prefixCls') === 'ant-tooltip').get(0).props.placement
        ).toEqual('right')
    })
})
