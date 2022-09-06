import { mount } from 'enzyme'
import WidgetErrorBoundary from './WidgetErrorBoundary'
import { WidgetTextMeta } from '../../interfaces/widget'
import { WidgetTypes } from '@tesler-ui/schema'
import React from 'react'
import { Store } from 'redux'
import { Store as CoreStore } from '../../interfaces/store'
import { mockStore } from '../../tests/mockStore'
import { Provider } from 'react-redux'

describe('WidgetErrorBoundary test', function () {
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
    let store: Store<CoreStore> = null
    beforeAll(() => {
        store = mockStore()
        store.getState().view.widgets = [meta]
    })
    afterAll(() => {
        jest.clearAllMocks()
    })
    it('should render with DebugPanel and "msg"', function () {
        const ThrowError = () => {
            throw new Error('Test')
        }
        const wrapper = mount(
            <Provider store={store}>
                <WidgetErrorBoundary meta={meta} msg="test msg">
                    <ThrowError />
                </WidgetErrorBoundary>
            </Provider>
        )
        expect(wrapper.find('.errorMessage').props().children).toBe('Test')
        expect(wrapper.find('Memo(DebugPanel)')).toHaveLength(1)
        expect((wrapper.find('.stackContainer').props().children as React.ReactNode[])[0]).toBe('test msg')
        expect(wrapper.find('.errorStack')).toHaveLength(1)
    })
    it('should render error message and stack only', function () {
        const ThrowError = () => {
            throw new Error('Test')
        }
        const wrapper = mount(
            <Provider store={store}>
                <WidgetErrorBoundary>
                    <ThrowError />
                </WidgetErrorBoundary>
            </Provider>
        )
        expect(wrapper.find('.errorMessage').props().children).toBe('Test')
        expect(wrapper.find('.errorStack')).toHaveLength(1)
        expect(wrapper.find('Memo(DebugPanel)')).toHaveLength(0)
    })
})
