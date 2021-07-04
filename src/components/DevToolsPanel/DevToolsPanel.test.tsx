import { shallow } from 'enzyme'
import DevToolsPanel from './DevToolsPanel'
import React from 'react'
import { Button } from 'antd'

describe('DevToolsPanel', () => {
    it('should render buttons and client controls', () => {
        const wrapper = shallow(
            <DevToolsPanel>
                <Button icon="icon-close" />
                <Button icon="down-circle" />
            </DevToolsPanel>
        )
        expect(wrapper.find('Memo(RefreshMetaButton)').length).toBe(1)
        expect(wrapper.find('Memo(DebugModeButton)').length).toBe(1)
        expect(wrapper.find('Button').findWhere(i => i.props().icon === 'icon-close').length).toBe(1)
        expect(wrapper.find('Button').findWhere(i => i.props().icon === 'down-circle').length).toBe(1)
    })
})
