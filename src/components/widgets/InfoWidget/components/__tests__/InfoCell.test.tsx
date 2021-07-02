import { shallow } from 'enzyme'
import * as React from 'react'
import InfoCell, { ValueCellProps } from '../InfoCell'
import { WidgetTypes } from '../../../../../interfaces/widget'
import { FieldType } from '../../../../../interfaces/view'

describe('InfoCell test', () => {
    const row = {
        cols: [
            {
                fieldKey: 'name',
                span: 10
            }
        ]
    }

    const props: ValueCellProps = {
        row: row,
        col: row.cols[0],
        cursor: '11111',
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
        data: { id: '5000', vstamp: 3, name: 'Test Name', number: '123456' },
        flattenWidgetFields: [
            { label: '#', key: 'number', type: FieldType.input },
            { label: 'Name', key: 'name', type: FieldType.input }
        ],
        onDrillDown: jest.fn()
    }
    const drillSpy = jest.spyOn(props, 'onDrillDown')
    afterAll(() => {
        drillSpy.mockRestore()
    })
    it('should render Field with TemplatedTitle', () => {
        const wrapper = shallow(<InfoCell {...props} />)
        expect(wrapper.find('Memo(InfoValueWrapper)').length).toEqual(1)
        expect(wrapper.find('Connect(TemplatedTitle)').length).toEqual(1)
        expect(wrapper.find('Connect(Field)').length).toEqual(1)
    })
    it('should render Field without TemplatedTitle', () => {
        const noTitleProps = { ...props }
        noTitleProps.flattenWidgetFields[1].label = ''
        const wrapper = shallow(<InfoCell {...noTitleProps} />)
        expect(wrapper.find('Connect(TemplatedTitle)').length).toEqual(0)
        expect(wrapper.find('Connect(Field)').length).toEqual(1)
    })
    it('should handle drilldown', () => {
        const drillProps = { ...props }
        drillProps.flattenWidgetFields[1].drillDown = true
        drillProps.flattenWidgetFields[1].drillDownTitle = 'drill'
        const wrapper = shallow(<InfoCell {...drillProps} />)
        wrapper.find('Memo(ActionLink)').simulate('click')
        expect(drillSpy).toHaveBeenCalled()
    })
    it('should render hint', () => {
        const drillProps = { ...props }
        drillProps.flattenWidgetFields[1].hintKey = 'number'
        const wrapper = shallow(<InfoCell {...drillProps} />)
        expect(wrapper.find('div').findWhere(i => i.hasClass('hint')).length).toBeGreaterThan(0)
    })
    it('should handle drilldown another condition', () => {
        const drillProps = { ...props }
        drillProps.flattenWidgetFields[1].drillDown = true
        drillProps.flattenWidgetFields[1].drillDownTitleKey = 'number'
        const wrapper = shallow(<InfoCell {...drillProps} />)
        wrapper.find('Memo(ActionLink)').simulate('click')
        expect(drillSpy).toHaveBeenCalled()
    })
    it('should render MultiValueListRecord', () => {
        const multiProps = { ...props }
        multiProps.flattenWidgetFields[1].type = FieldType.multivalue
        multiProps.data.name = [{ id: '1', value: 'test name' }]
        const wrapper = shallow(<InfoCell {...multiProps} />)
        expect(wrapper.find('Connect(MultiValueListRecord)').length).toEqual(1)
    })
    it('should not render MultiValueListRecord another condition', () => {
        const multiProps = { ...props }
        multiProps.flattenWidgetFields[1].type = FieldType.multivalue
        delete multiProps.data.name
        const wrapper = shallow(<InfoCell {...multiProps} />)
        expect(wrapper.find('Connect(MultiValueListRecord)').length).toEqual(0)
    })
})
