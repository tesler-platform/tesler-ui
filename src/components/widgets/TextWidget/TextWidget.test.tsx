import { shallow } from 'enzyme'
import TextWidget from './TextWidget'
import { WidgetTextMeta } from '../../../interfaces/widget'
import { WidgetTypes } from '@tesler-ui/schema'
import React from 'react'

describe('TextWidget test', function () {
    const meta: WidgetTextMeta = {
        name: 'name',
        title: 'title',
        bcName: 'test',
        fields: [],
        gridWidth: 2,
        position: 1,
        type: WidgetTypes.Text,
        description: 'test text',
        descriptionTitle: 'test title'
    }
    it('should render', function () {
        const wrapper = shallow(<TextWidget meta={meta} />)
        expect(wrapper.find('p').props().children).toBe('test text')
    })
})
