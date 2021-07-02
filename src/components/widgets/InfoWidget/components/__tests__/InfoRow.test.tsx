import { shallow } from 'enzyme'
import * as React from 'react'
import InfoRow, { InfoRowProps } from '../InfoRow'
import { WidgetTypes } from '../../../../../interfaces/widget'
import { FieldType } from '../../../../../interfaces/view'

describe('InfoRow test', () => {
    const props: InfoRowProps = {
        cursor: '5000',
        data: { id: '5000', vstamp: 3, name: 'Test Name', number: '123456' },
        fields: [
            {
                key: 'name',
                currentValue: 'Test Name',
                disabled: true,
                forceActive: false,
                ephemeral: false,
                hidden: false
            },
            {
                key: 'number',
                currentValue: '123456',
                disabled: true,
                forceActive: false,
                ephemeral: false,
                hidden: false
            }
        ],
        flattenWidgetFields: [
            { label: '#', key: 'number', type: FieldType.input },
            { label: 'Name', key: 'name', type: FieldType.input }
        ],
        index: 10,
        meta: {
            name: 'testInfo',
            type: WidgetTypes.Info,
            title: 'Test Info',
            bcName: 'testBcName',
            gridWidth: 2,
            position: 1,
            fields: [
                {
                    blockId: 1,
                    name: 'AAA',
                    fields: [
                        { label: '#', key: 'number', type: FieldType.input },
                        { label: 'Name', key: 'name', type: FieldType.input }
                    ]
                }
            ]
        },
        onDrillDown: jest.fn(),
        row: {
            cols: [
                {
                    fieldKey: 'name',
                    span: 10
                }
            ]
        }
    }

    it('should render one InfoCell', () => {
        const wrapper = shallow(<InfoRow {...props} />)
        expect(wrapper.find('Memo(InfoCell)').length).toEqual(1)
    })

    it('should render no one InfoCell', () => {
        const noCellProps = { ...props }
        noCellProps.fields[0].hidden = true
        const wrapper = shallow(<InfoRow {...noCellProps} />)
        expect(wrapper.find('Memo(InfoCell)').length).toEqual(0)
    })
})
