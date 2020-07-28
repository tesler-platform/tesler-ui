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
import {shallow} from 'enzyme'
import ColumnTitle, {notSortableFields} from '../ColumnTitle'
import {WidgetListField} from '../../../interfaces/widget'
import {FieldType} from '../../../interfaces/view'
import TemplatedTitle from '../../TemplatedTitle/TemplatedTitle'
import ColumnFilter from '../ColumnFilter'
import ColumnSort from '../ColumnSort'
import {RowMetaField} from '../../../interfaces/rowMeta'

describe('`<ColumnTitle />`', () => {

    it('renders null without widget meta', () => {
        const wrapper = shallow(<ColumnTitle widgetMeta={null} widgetName={null} rowMeta={null} />)
        expect(wrapper.equals(null))
    })

    it('renders default `<TemplatedTitle />` without row meta', () => {
        const wrapper = shallow(<ColumnTitle widgetMeta={widgetFieldMeta} widgetName={null} rowMeta={null} />)
        expect(wrapper.find(TemplatedTitle)).toHaveLength(1)
        expect(wrapper.find(ColumnFilter)).toHaveLength(0)
        expect(wrapper.find(ColumnSort)).toHaveLength(0)
    })

    it('renders `<ColumnSort />` only for supported field types', () => {
        notSortableFields.map(type =>
            <ColumnTitle
                widgetName={null}
                widgetMeta={{ ...widgetFieldMeta, type: type as any }}
                rowMeta={fieldRowMeta}
            />
        ).forEach(component => {
            const wrapperNotSupported = shallow(component)
            expect(wrapperNotSupported.find(ColumnSort)).toHaveLength(0)
        })
        const wrapper = shallow(<ColumnTitle widgetMeta={widgetFieldMeta} widgetName={null} rowMeta={fieldRowMeta} />)
        expect(wrapper.find(ColumnSort)).toHaveLength(1)
    })

    it('renders `<ColumnFilter />` only when field is marked filterable in row meta', () => {
        expect(shallow(<ColumnTitle
            widgetMeta={widgetFieldMeta}
            widgetName={null}
            rowMeta={fieldRowMeta}
        />).find(ColumnFilter)).toHaveLength(0)
        expect(shallow(<ColumnTitle
            widgetMeta={widgetFieldMeta}
            widgetName={null}
            rowMeta={{ ...fieldRowMeta, filterable: true }}
        />).find(ColumnFilter)).toHaveLength(1)
    })

    it('renders custom component instead of `<ColunFilter />`', () => {
        const CustomFilter = () => <div>custom</div>
        const wrapper = shallow(<ColumnTitle
            widgetMeta={widgetFieldMeta}
            widgetName={null}
            rowMeta={{ ...fieldRowMeta, filterable: true }}
            components={{ filter: CustomFilter }}
        />)
        expect(wrapper.find(ColumnFilter)).toHaveLength(0)
        expect(wrapper.find(CustomFilter)).toHaveLength(1)
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
