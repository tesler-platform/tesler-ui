import React from 'react'
import { mount } from 'enzyme'
import { HierarchyTable } from './HierarchyTable'
import { hierarchyWidgetProps } from '../../mocks/data/widgetMeta'

describe('HierarchyTable', () => {
    it.skip('renders', () => {
        const wrapper = mount(<HierarchyTable {...hierarchyWidgetProps} />)
        expect(wrapper).toBeTruthy()
    })
})
