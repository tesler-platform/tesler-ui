import React from 'react'
import { mount } from 'enzyme'
import { mockStore } from '../../../../tests/mockStore'
import { Store as CoreStore } from '../../../../interfaces/store'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import ViewInfoLabel from '../ViewInfoLabel'

describe('ViewInfoLabel', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.screenName = 'some screen name'
        store.getState().view.name = 'some view name'
    })

    it('should render', () => {
        const wrapper = mount(
            <Provider store={store}>
                <ViewInfoLabel />
            </Provider>
        )
        expect(wrapper.find('span').findWhere(i => i.text() === 'Screen').length).toBeGreaterThan(0)
        expect(wrapper.find('span').findWhere(i => i.text() === 'View').length).toBeGreaterThan(0)
    })
})
