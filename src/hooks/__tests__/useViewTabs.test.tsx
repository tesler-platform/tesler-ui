/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as navigationFlatSample from '../../utils/__tests__/__mocks__/navigationFlat.json'
import { useViewTabs } from '../useViewTabs'
import React from 'react'
import { mount } from 'enzyme'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import { mockStore } from '../../tests/mockStore'
import { Store as CoreStore } from '../../interfaces/store'

describe('useViewTabs', () => {
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
                    navigation: navigationFlatSample,
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

    it('returns tabs', () => {
        const Test = () => {
            const tabs = useViewTabs(1)
            return (
                <ul>
                    {tabs.map(item => (
                        <li key={item.viewName}>
                            <a href={item.url} className={item.selected ? 'selected' : undefined}>
                                {`${item.viewName}:${item.title}`}
                            </a>
                        </li>
                    ))}
                </ul>
            )
        }
        const wrapper = mount(
            <Provider store={store}>
                <Test />
            </Provider>
        )
        const links = wrapper.find('a')
        expect(links.length).toBe(2)
        expect(links.at(0).props().children).toBe('banklist:Bank List')
        expect(links.at(0).props().href).toBe('view/view-1')
        expect(links.at(0).props().className).toBe(undefined)
        expect(links.at(1).props().href).toBe('view/view-2')
        expect(links.at(1).props().className).toBe('selected')
    })

    it('does not crash when screen is missing', () => {
        store.getState().screen.screenName = null
        const Test = () => {
            const tabs = useViewTabs(1)
            return (
                <ul>
                    {tabs.map(item => (
                        <li key={item.viewName}>
                            <a href={item.url} className={item.selected ? 'selected' : undefined}>
                                {`${item.viewName}:${item.title}`}
                            </a>
                        </li>
                    ))}
                </ul>
            )
        }
        const wrapper = mount(
            <Provider store={store}>
                <Test />
            </Provider>
        )
        expect(wrapper.find('a').length).toBe(0)
    })

    it('does not crash when view is missing', () => {
        store.getState().screen.views = [{ name: 'banklist', url: 'view/view-1', title: 'Bank List', widgets: [] }]
        const Test = () => {
            const tabs = useViewTabs(1)
            return (
                <ul>
                    {tabs.map(item => (
                        <li key={item.viewName}>
                            <a href={item.url} className={item.selected ? 'selected' : undefined}>
                                {`${item.viewName}:${item.title}`}
                            </a>
                        </li>
                    ))}
                </ul>
            )
        }
        const wrapper = mount(
            <Provider store={store}>
                <Test />
            </Provider>
        )
        expect(wrapper.find('a').length).toBe(2)
        expect(wrapper.find('a').at(1).props().href).toBe(undefined)
        expect(wrapper.find('a').at(1).props().children).toBe('bankcard:undefined')
    })
})
