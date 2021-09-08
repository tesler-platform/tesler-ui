import React from 'react'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import NavigationTabs from './NavigationTabs'

describe('NavigationTabs test', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().view.name = 'bankcard'
        store.getState().session.screens = [
            {
                id: '0',
                name: 'screen-example',
                url: 'd',
                text: 'dd',
                meta: {
                    bo: null,
                    navigation: {
                        menu: [
                            {
                                viewName: 'banklist'
                            },
                            {
                                viewName: 'bankcard'
                            }
                        ]
                    },
                    views: []
                }
            }
        ]
    })

    beforeEach(() => {
        store.getState().screen.screenName = 'screen-example'
        store.getState().screen.views = [
            { name: 'banklist', url: 'view/view-1', title: 'Bank List', widgets: [] },
            { name: 'bankcard', url: 'view/view-2', widgets: [] }
        ]
    })
    it('should render tabs', () => {
        const wrapper = mount(
            <Provider store={store}>
                <NavigationTabs navigationLevel={1} />
            </Provider>
        )
        expect(wrapper.find('span').findWhere(i => i.props().className === 'item').length).toBe(2)
    })
})
