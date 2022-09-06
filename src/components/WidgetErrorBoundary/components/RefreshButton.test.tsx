import { mount } from 'enzyme'
import React from 'react'
import RefreshButton from './RefreshButton'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'

describe('RefreshButton test', function () {
    let store: Store<CoreStore> = null
    beforeAll(() => {
        store = mockStore()
    })
    afterAll(() => {
        jest.clearAllMocks()
    })
    it('should render and handle click', function () {
        const wrapper = mount(
            <Provider store={store}>
                <RefreshButton />
            </Provider>
        )
        wrapper.find('button').at(0).simulate('click')
        expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: null, type: 'refreshMetaAndReloadPage' }))
    })
})
