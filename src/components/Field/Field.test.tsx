import React from 'react'
import {mount} from 'enzyme'
import {Store} from 'redux'
import {Provider} from 'react-redux'
import {mockStore} from '../../tests/mockStore'
import {
    CheckboxFieldMeta,
    DateFieldMeta,
    DictionaryFieldMeta,
    InputFieldMeta,
    MultiFieldMeta,
    MultivalueFieldMeta,
    NumberFieldMeta,
    PickListFieldMeta,
    RadioButtonFieldMeta,
    TextFieldMeta,
    WidgetField,
    WidgetTypes
} from '../../interfaces/widget'
import {Store as CoreStore} from '../../interfaces/store'
import {FieldType} from '../../interfaces/view'
import Field from './Field'
import ActionLink from '../ui/ActionLink/ActionLink'
import ReadOnlyField from '../ui/ReadOnlyField/ReadOnlyField'
import CheckboxPicker from '../ui/CheckboxPicker/CheckboxPicker'
import RadioButton from '../ui/RadioButton/RadioButton'
import MultivalueHover from '../ui/Multivalue/MultivalueHover'

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

    it('should render Input with `maxLength` prop', () => {
        const maxLengthFieldMeta = {...fieldMeta, maxInput: 5, drillDown: false}
        const maxLengthFieldProperties = {...fieldProperties, readonly: false}
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...maxLengthFieldProperties}
                    widgetFieldMeta={maxLengthFieldMeta}
                />
            </Provider>
        )
        expect(wrapper.find('Input').findWhere(i => i.prop('maxLength') === 5).length).toBeGreaterThan(0)
    })

    it('should render TextArea', () => {
        const textFieldMeta = {key: 'someInput', title: 'test', type: FieldType.text, maxInput: 5}
        const textFieldProperties = {...fieldProperties, readonly: false}
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...textFieldProperties}
                    widgetFieldMeta={textFieldMeta as TextFieldMeta}
                />
            </Provider>
        )
        expect(wrapper.find('Input').findWhere(i => i.prop('maxLength') === 5).length).toEqual(0)
        expect(wrapper.find('TextArea').findWhere(i => i.prop('maxLength') === 5).length).toBeGreaterThan(0)
    })

    it('should render DatePickerField', () => {
        const dateFieldMeta = {key: 'someInput', type: FieldType.date, label: fieldName,}
        const dateFieldProperties = {...fieldProperties, readonly: false}
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...dateFieldProperties}
                    widgetFieldMeta={dateFieldMeta as DateFieldMeta}
                />
            </Provider>
        )
        expect(wrapper.find('Memo(DatePickerField)').length).toEqual(1)
    })

    it('should render NumberInput at Number type', () => {
        const numberFieldMeta = {key: 'someInput', type: FieldType.number, label: fieldName,}
        const numberFieldProperties = {...fieldProperties, readonly: false}
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...numberFieldProperties}
                    widgetFieldMeta={numberFieldMeta as NumberFieldMeta}
                />
            </Provider>
        )
        expect(wrapper.find('Memo(NumberInput)').length).toEqual(1)
    })

    it('should render NumberInput at Money type', () => {
        const numberFieldMeta = {key: 'someInput', type: FieldType.money, label: fieldName,}
        const numberFieldProperties = {...fieldProperties, readonly: false}
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...numberFieldProperties}
                    widgetFieldMeta={numberFieldMeta as NumberFieldMeta}
                />
            </Provider>
        )
        expect(wrapper.find('Memo(NumberInput)').length).toEqual(1)
    })

    it('should render NumberInput at Percent type', () => {
        const numberFieldMeta = {key: 'someInput', type: FieldType.percent, label: fieldName,}
        const numberFieldProperties = {...fieldProperties, readonly: false}
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...numberFieldProperties}
                    widgetFieldMeta={numberFieldMeta as NumberFieldMeta}
                />
            </Provider>
        )
        expect(wrapper.find('Memo(NumberInput)').length).toEqual(1)
    })

    it('should render Checkbox', () => {
        const checkboxFieldMeta = {key: 'someInput', type: FieldType.checkbox, label: fieldName,}
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...fieldProperties}
                    widgetFieldMeta={checkboxFieldMeta as CheckboxFieldMeta}
                />
            </Provider>
        )
        expect(wrapper.find(CheckboxPicker).length).toEqual(1)
    })

    it('should render Radio', () => {
        const radioButtonFieldMeta = {key: 'someInput', type: FieldType.radio, label: fieldName,}
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...fieldProperties}
                    widgetFieldMeta={radioButtonFieldMeta as RadioButtonFieldMeta}
                />
            </Provider>
        )
        expect(wrapper.find(RadioButton).length).toEqual(1)
    })

    it('should render Hint', () => {
        const hintFieldMeta = {key: 'someInput', type: FieldType.hint, label: fieldName,}
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...fieldProperties}
                    widgetFieldMeta={hintFieldMeta as InputFieldMeta}
                />
            </Provider>
        )
        expect(wrapper.find(ReadOnlyField).length).toEqual(1)
    })

    it('should render MultivalueHover', () => {
        const multivalueHoverFieldMeta = {key: 'someInput', type: FieldType.multivalueHover, label: fieldName,}
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...fieldProperties}
                    widgetFieldMeta={multivalueHoverFieldMeta as MultivalueFieldMeta}
                />
            </Provider>
        )
        expect(wrapper.find(MultivalueHover).length).toEqual(1)
    })

    it('should render Dictionary', () => {
        const dictionaryFieldMeta = {key: 'someInput', type: FieldType.dictionary, label: fieldName,}
        const dictionaryFieldProperties = {...fieldProperties, readonly: false}
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...dictionaryFieldProperties}
                    widgetFieldMeta={dictionaryFieldMeta as DictionaryFieldMeta}
                />
            </Provider>
        )
        expect(wrapper.find('Memo(Dictionary)').length).toEqual(1)
    })

    it('should render MultiField', () => {
        const multifieldFieldMeta: MultiFieldMeta = {
            key: 'someInput',
            type: FieldType.multifield,
            label: fieldName,
            style: 'inline',
            fields: []
        }
        const multifieldFieldProperties = {...fieldProperties, readonly: false}
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...multifieldFieldProperties}
                    widgetFieldMeta={multifieldFieldMeta}
                />
            </Provider>
        )
        expect(wrapper.find('Memo(MultiField)').length).toEqual(1)
    })

    it('should render MultivalueField', () => {
        const multivalueFieldMeta: MultivalueFieldMeta = {
            key: 'someInput',
            type: FieldType.multivalue,
            label: fieldName,
        }
        const multivalueFieldProperties = {...fieldProperties, readonly: false}
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...multivalueFieldProperties}
                    widgetFieldMeta={multivalueFieldMeta}
                />
            </Provider>
        )
        expect(wrapper.find('MultivalueField').length).toEqual(1)
    })

    it('should render PickListField', () => {
        const pickListFieldMeta: PickListFieldMeta = {
            key: 'someInput',
            type: FieldType.pickList,
            label: fieldName,
            popupBcName: 'popupBcName',
            pickMap: {},
        }
        const pickListFieldProperties = {...fieldProperties, readonly: false}
        const wrapper = mount(
            <Provider store={store}>
                <Field
                    {...pickListFieldProperties}
                    widgetFieldMeta={pickListFieldMeta}
                />
            </Provider>
        )
        expect(wrapper.find('PickListField').length).toEqual(1)
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
