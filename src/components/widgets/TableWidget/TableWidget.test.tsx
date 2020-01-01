import React from 'react'
import {shallow} from 'enzyme'
import {TableWidget} from './TableWidget'
import {WidgetTypes, WidgetTableMeta} from 'interfaces/widget'

const widgetMeta = {
    name: '1',
    type: WidgetTypes.List,
    title: 'Таблица',
    bcName: 'bcExample',
    position: 1,
    gridWidth: 1,
    fields: [
        {label: 'testField-1', key: 'testKey-1', type: 'text'},
        {label: 'testField-2', key: 'testKey-2', type: 'text'},
        {label: 'testField-3', key: 'testKey-3', type: 'text'},
        {label: 'testField-4', key: 'testKey-4', type: 'text'},
        {label: 'testField-5', key: 'testKey-5', type: 'text'},
    ]
}

describe('render', () => {
    
    it.skip('should render available `data` items', () => {
        // TODO:
    })

    // TODO: columns and other things
})

describe('readOnly', () => {

    it.skip('should be editable by default', () => {
        const wrapper = shallow(
            <TableWidget
                meta={widgetMeta as WidgetTableMeta}
                data={[]}
                cursor="1"
                rowMetaFields={null}
                selectedCell={null}
                onShowAll={null}
                onSelectRow={null}
                onSelectCell={null}
            />
        )
        // TODO:
        expect(wrapper).toBeTruthy()
    })

    it.skip('should not be editable when widget has readOnly flag', () => {
        // TODO:
    })

    it.skip('should have editable cell when selected', () => {
        // TODO:
    })

})

describe('showRowActions', () => {

    it.skip('should show dots icon when row is hovered', () => {
        // TODO:
    })

    it.skip('should not show dots icon when showRowActions is false', () => {
        // TODO:
    })

    it.skip('should open <RowOperations /> when dots is clicked', () => {
        // TODO:
    })

    it.skip('should close <RowOperations /> when operation is clicked', () => {
        // TODO:
    })
})

describe('limitBySelf', () => {
    it.skip('should have `Show other records` button when url is matched', () => {
        // TODO: redux-aware test
    })

    it.skip('should not have `Show other records` button when url is not matched', () => {
        // TODO:
    })

    it.skip('should change url and show other records when `Show other records` button is clicked', () => {
        // TODO:
    })
})

describe('drilldowns', () => {

})
