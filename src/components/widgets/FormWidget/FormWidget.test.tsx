import React from 'react'
import { shallow } from 'enzyme'
import { FormWidget } from './FormWidget'
import { WidgetFormMeta, WidgetTypes } from '../../../interfaces/widget'

const widgetMeta = {
    name: '1',
    type: WidgetTypes.Form,
    title: 'Form',
    bcName: 'bcExample',
    position: 1,
    gridWidth: 1,
    fields: [
        { label: 'testField-1', key: 'testKey-1', type: 'text' },
        { label: 'testField-2', key: 'testKey-2', type: 'text' },
        { label: 'testField-3', key: 'testKey-3', type: 'text' },
        { label: 'testField-4', key: 'testKey-4', type: 'text' },
        { label: 'testField-5', key: 'testKey-5', type: 'text' }
    ],
    options: {
        layout: {
            rows: [
                { cols: [{ fieldKey: 'testKey-1', span: 24 }] },
                { cols: [{ fieldKey: 'testKey-2', span: 12 }] },
                { cols: [{ fieldKey: 'testKey-3', span: 6 }] },
                {
                    cols: [
                        { fieldKey: 'testKey-4', span: 12 },
                        { fieldKey: 'testKey-5', span: 12 }
                    ]
                }
            ]
        }
    }
}

describe('FormWidget columns and blocks test', () => {
    it('component should render 4 rows', () => {
        const wrapper = shallow(
            <FormWidget cursor={null} meta={widgetMeta as WidgetFormMeta} fields={[]} metaErrors={null} missingFields={null} />
        )
        const form = wrapper.find('Form')
        const rows = form.find('Row').at(0)
        expect(rows.children().length === 4)
        expect(rows.childAt(2).find('FormItem').props().label === 'testField-3')
    })

    it('Test each row', () => {
        const wrapper = shallow(
            <FormWidget cursor={null} meta={widgetMeta as WidgetFormMeta} fields={[]} metaErrors={null} missingFields={null} />
        )
        const form = wrapper.find('Form')
        const rows = form.find('Row').at(0)

        const row1 = rows.childAt(0)
        expect(row1.find('Col').length === 1)
        expect(row1.find('Col').at(0).props().span === 24)

        const row2 = rows.childAt(1)
        expect(row2.find('Col').length === 1)
        expect(row2.find('Col').at(0).props().span === 12)

        const row3 = rows.childAt(2)
        expect(row3.find('Col').length === 1)
        expect(row3.find('Col').at(0).props().span === 6)

        const row4 = rows.childAt(3)
        expect(row4.find('Col').length === 2)
        expect(row4.find('Col').at(0).props().span === 12)
    })

    it('should hide "hidden": true fields', () => {
        const toHideWidgetMeta = { ...widgetMeta } as any
        toHideWidgetMeta.fields[0].hidden = true
        const wrapper = shallow(
            <FormWidget cursor={null} meta={toHideWidgetMeta as WidgetFormMeta} fields={[]} metaErrors={null} missingFields={null} />
        )
        const form = wrapper.find('Form')
        const rows = form.find('Row').at(0)

        const row1 = rows.childAt(0)
        expect(row1.find('Col').length === 1)
        expect(row1.props().children).toEqual([])
    })
})
