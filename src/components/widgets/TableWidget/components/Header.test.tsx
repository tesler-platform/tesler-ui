import React from 'react'
import { mount, ReactWrapper } from 'enzyme'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../../interfaces/store'
import { mockStore } from '../../../../tests/mockStore'
import * as redux from 'react-redux'
import { Provider } from 'react-redux'
import Header, { HeaderProps } from './Header'
import { FilterType } from '../../../../interfaces/filters'
import { ActionLink } from '../../../index'
import { initLocale } from '../../../../imports/i18n'
import i18n from 'i18next'
import Select from '../../../ui/Select/Select'

describe('TableWidget > Header test', () => {
    let store: Store<CoreStore> = null
    let wrapper: ReactWrapper = null

    const dispatch = jest.fn()

    beforeAll(() => {
        initLocale('en', null)
        store = mockStore()
    })

    beforeEach(() => {
        jest.spyOn(redux, 'useDispatch').mockImplementation(() => {
            return dispatch
        })
    })

    afterEach(() => {
        dispatch.mockClear()
        jest.resetAllMocks()
    })

    function getMountWrapper() {
        const restProps: HeaderProps = {
            bcName: 'bcName',
            widgetName: 'widgetName'
        }

        return mount(
            <Provider store={store}>
                <Header {...restProps} />
            </Provider>
        )
    }

    it('should render header', () => {
        wrapper = getMountWrapper()

        const headerComponent = wrapper.find(Header)
        expect(headerComponent).toHaveLength(1)
    })

    it('header contain clearing button', () => {
        store.getState().screen.filters.bcName = [
            {
                type: 'equalsOneOf' as FilterType,
                value: ['Low', 'Middle'],
                fieldName: 'importance',
                viewName: 'clientlist',
                widgetName: 'clientList'
            }
        ]

        wrapper = getMountWrapper()
        const headerComponent = wrapper.find(Header)
        const actionLinkComponent = headerComponent.find(ActionLink)

        expect(actionLinkComponent).toHaveLength(1)
        expect(actionLinkComponent.text().trim()).toBe(i18n.t('Clear all filters'))
    })

    it("header don't contain clearing button", () => {
        store.getState().screen.filters.bcName = []

        wrapper = getMountWrapper()
        const headerComponent = wrapper.find(Header)
        const actionLinkComponent = headerComponent.find(ActionLink)

        expect(actionLinkComponent).toHaveLength(0)
    })

    it('header contain select for filter groups', () => {
        store.getState().screen.bo.bc = {
            bcName: {
                name: 'bcName',
                parentName: null,
                url: '',
                cursor: null,
                filterGroups: [
                    {
                        name: 'Example PDQ 1',
                        filters: 'someField1.contains=123'
                    },
                    {
                        name: 'Example PDQ 2',
                        filters: 'someField1.contains=321&someField2.equalsOneOf=["Confirmed", "Canceled"]'
                    }
                ]
            }
        }

        wrapper = getMountWrapper()
        const headerComponent = wrapper.find(Header)
        const selectComponent = headerComponent.find(Select)

        expect(selectComponent).toHaveLength(1)
    })
})
