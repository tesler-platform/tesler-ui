/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import ColumnFilterControl from './FilterField'
import { mount } from 'enzyme'
import { DatePicker, Checkbox, Input } from 'antd'
import moment from 'moment'
import { WidgetListField } from '../../../interfaces/widget'
import { FieldType } from '../../../interfaces/view'
import { RowMetaField } from '../../../interfaces/rowMeta'
import { CheckboxFilter } from '../CheckboxFilter/CheckboxFilter'
import RangePicker from './components/RangePicker'

describe('`<ColumnFilterControl />`', () => {
    it('renders `<DatePicker />` for date', () => {
        const onChange = jest.fn()
        const wrapper = mount(
            <ColumnFilterControl
                widgetFieldMeta={{ ...widgetFieldMeta, type: FieldType.date }}
                rowFieldMeta={fieldRowMeta}
                value={null}
                onChange={onChange}
            />
        )
        expect(wrapper.find(DatePicker)).toHaveLength(1)
        const now = moment()
        wrapper.find(DatePicker).invoke('onChange')(now, null)
        expect(onChange).toBeCalledWith(now.toISOString())
    })

    it('renders `<RangePIcker />` for date', () => {
        const onChange = jest.fn()
        const wrapper = mount(
            <ColumnFilterControl
                widgetOptions={{ filterDateByRange: true }}
                widgetFieldMeta={{ ...widgetFieldMeta, type: FieldType.date }}
                rowFieldMeta={fieldRowMeta}
                value={null}
                onChange={onChange}
            />
        )
        expect(wrapper.find(RangePicker)).toHaveLength(1)
        const now = moment()
        wrapper.find(RangePicker).invoke('onChange')([now.toISOString(), null])
        expect(onChange).toBeCalledWith([now.toISOString(), null])
    })
    it('renders `<CheckboxFilter />` for dictionary', () => {
        const onChange = jest.fn()
        const wrapper = mount(
            <ColumnFilterControl
                widgetFieldMeta={{ ...widgetFieldMeta, type: FieldType.dictionary }}
                rowFieldMeta={{ ...fieldRowMeta, filterValues: [{ value: 'One' }, { value: 'Two' }] }}
                value={null}
                onChange={onChange}
            />
        )
        expect(wrapper.find(CheckboxFilter)).toHaveLength(1)
    })
    it('renders `<Checkbox />` for checkbox', () => {
        const onChange = jest.fn()
        const wrapper = mount(
            <ColumnFilterControl
                widgetFieldMeta={{ ...widgetFieldMeta, type: FieldType.checkbox }}
                rowFieldMeta={fieldRowMeta}
                value={null}
                onChange={onChange}
            />
        )
        expect(wrapper.find(Checkbox)).toHaveLength(1)
        const e = { target: { checked: true } } as any
        wrapper.find(Checkbox).invoke('onChange')(e)
        expect(onChange).toBeCalledWith(true)
    })
    it('renders `<Input />` for other field types', () => {
        const onChange = jest.fn()
        const wrapper = mount(
            <ColumnFilterControl widgetFieldMeta={widgetFieldMeta} rowFieldMeta={fieldRowMeta} value={null} onChange={onChange} />
        )
        expect(wrapper.find(Input)).toHaveLength(1)
    })
    /**
     * TODO: Strange behavior, should be maxLength property instead of onchange check
     */
    it('limits <Input /> onchange in 100 chars', () => {
        const onChange = jest.fn()
        const wrapper = mount(
            <ColumnFilterControl widgetFieldMeta={widgetFieldMeta} rowFieldMeta={fieldRowMeta} value={null} onChange={onChange} />
        )
        expect(wrapper.find(Input)).toHaveLength(1)
        const longValue = new Array(105).fill('a').join('')
        const e = { target: { value: longValue } } as any
        wrapper.find(Input).invoke('onChange')(e)
        expect(onChange).toBeCalledWith(longValue.substr(0, 100))
    })
})

const widgetFieldMeta: WidgetListField = {
    key: 'key',
    title: 'Test Column',
    type: FieldType.input
}

const fieldRowMeta: RowMetaField = {
    key: 'key',
    currentValue: null
}

describe('dateTimeWithSeconds field', () => {
    it('should render DatePicker', function () {
        const onChange = jest.fn()
        const wrapper = mount(
            <ColumnFilterControl
                widgetFieldMeta={{ ...widgetFieldMeta, type: FieldType.dateTimeWithSeconds }}
                rowFieldMeta={fieldRowMeta}
                value={null}
                onChange={onChange}
            />
        )
        expect(wrapper.find(DatePicker)).toHaveLength(1)
    })

    it('should render RangePicker', function () {
        const onChange = jest.fn()
        const wrapper = mount(
            <ColumnFilterControl
                widgetOptions={{ filterDateByRange: true }}
                widgetFieldMeta={{ ...widgetFieldMeta, type: FieldType.dateTimeWithSeconds }}
                rowFieldMeta={fieldRowMeta}
                value={null}
                onChange={onChange}
            />
        )
        expect(wrapper.find(RangePicker)).toHaveLength(1)
    })
})

describe('dateTime field', () => {
    it('should render DatePicker', function () {
        const onChange = jest.fn()
        const wrapper = mount(
            <ColumnFilterControl
                widgetFieldMeta={{ ...widgetFieldMeta, type: FieldType.dateTime }}
                rowFieldMeta={fieldRowMeta}
                value={null}
                onChange={onChange}
            />
        )
        expect(wrapper.find(DatePicker)).toHaveLength(1)
    })

    it('should render RangePicker', function () {
        const onChange = jest.fn()
        const wrapper = mount(
            <ColumnFilterControl
                widgetOptions={{ filterDateByRange: true }}
                widgetFieldMeta={{ ...widgetFieldMeta, type: FieldType.dateTime }}
                rowFieldMeta={fieldRowMeta}
                value={null}
                onChange={onChange}
            />
        )
        expect(wrapper.find(RangePicker)).toHaveLength(1)
    })
})
