import React from 'react'
import {Popup, PopupProps, widths} from './Popup'
import {shallow} from 'enzyme'
import {Modal} from 'antd'

describe('Popup test', () => {
    const defProps: PopupProps = {
        onOkHandler: jest.fn(),
        onCancelHandler: jest.fn(),
        children: <p>default child</p>,
        showed: true,
        bcName: 'bcName',
        widgetName: 'widgetName',
        disablePagination: true,
        defaultOkText: 'defaultOkText',
        defaultCancelText: 'defaultCancelText'
    }

    it('should be rendered with medium width as default', () => {
        const wrapper = shallow(<Popup {...defProps}/>)
        expect(wrapper.find(Modal).length).toEqual(1)
        expect(wrapper.find(Modal).props().width).toEqual(widths.medium)
    })

    it('should accept custom width', () => {
        const customWidth = 111
        const wrapper = shallow(<Popup {...defProps} width={customWidth}/>)
        expect(wrapper.find(Modal).props().width).toEqual(customWidth)
    })
})
