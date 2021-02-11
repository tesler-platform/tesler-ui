import React from 'react'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import * as redux from 'react-redux'
import { Button } from 'antd'
import { mount, ReactWrapper } from 'enzyme'
import Pagination from './Pagination'
import { $do } from '../../../actions/actions'
import { Store as CoreStore } from '../../../interfaces/store'
import { PaginationMode } from '../../../interfaces/widget'
import { mockStore } from '../../../tests/mockStore'

describe('`<Pagination />` page mode', () => {
    let store: Store<CoreStore> = null
    const dispatch = jest.fn()

    beforeAll(() => {
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
        delete store.getState().screen.bo.bc.bcExample
    })

    it('renders prev/next buttons', () => {
        store.getState().screen.bo.bc.bcExample = { ...bcExample, hasNext: true }
        const wrapper = mount(
            <Provider store={store}>
                <Pagination bcName="bcExample" mode={PaginationMode.page} />)
            </Provider>
        )
        expect(wrapper.find(Button)).toHaveLength(2)
        expect(wrapper.find(Button).at(0).props().icon).toBe('left')
        expect(wrapper.find(Button).at(1).props().icon).toBe('right')
    })

    it('disables prev button on the first page', () => {
        store.getState().screen.bo.bc.bcExample = { ...bcExample, hasNext: true, page: 1 }
        let wrapper = mount(
            <Provider store={store}>
                <Pagination bcName="bcExample" mode={PaginationMode.page} />)
            </Provider>
        )
        expect(wrapper.find(Button)).toHaveLength(2)
        expect(wrapper.findWhere(predicatePrevButton).props().disabled).toBe(true)
        expect(wrapper.findWhere(predicateNextButton).props().disabled).toBe(false)
        wrapper.findWhere(predicatePrevButton).simulate('click')
        expect(dispatch).toBeCalledTimes(0)
        store.getState().screen.bo.bc.bcExample = { ...bcExample, hasNext: true, page: 2 }
        wrapper = mount(
            <Provider store={store}>
                <Pagination bcName="bcExample" mode={PaginationMode.page} />)
            </Provider>
        )
        expect(wrapper.find(Button)).toHaveLength(2)
        expect(wrapper.findWhere(predicatePrevButton).props().disabled).toBe(false)
        expect(wrapper.findWhere(predicateNextButton).props().disabled).toBe(false)
    })

    it('fires `bcChangePage` and optional `onChangePage` callback on prev and next click', () => {
        store.getState().screen.bo.bc.bcExample = { ...bcExample, hasNext: true, page: 8 }
        const wrapper = mount(
            <Provider store={store}>
                <Pagination bcName="bcExample" mode={PaginationMode.page} widgetName="widgetExample" />
            </Provider>
        )
        wrapper.findWhere(predicatePrevButton).simulate('click')
        expect(dispatch.mock.calls[0][0]).toEqual(
            expect.objectContaining(
                $do.bcChangePage({
                    bcName: 'bcExample',
                    page: 7,
                    widgetName: 'widgetExample'
                })
            )
        )
        wrapper.findWhere(predicateNextButton).simulate('click')
        expect(dispatch.mock.calls[1][0]).toEqual(
            expect.objectContaining(
                $do.bcChangePage({
                    bcName: 'bcExample',
                    page: 9,
                    widgetName: 'widgetExample'
                })
            )
        )
    })

    it('fires optional `onChangePage` callback on prev and next click', () => {
        store.getState().screen.bo.bc.bcExample = { ...bcExample, hasNext: true, page: 2 }
        const onChangePage = jest.fn()
        const wrapper = mount(
            <Provider store={store}>
                <Pagination bcName="bcExample" mode={PaginationMode.page} widgetName="widgetExample" onChangePage={onChangePage} />
            </Provider>
        )
        wrapper.findWhere(predicatePrevButton).simulate('click')
        expect(onChangePage).toHaveBeenLastCalledWith(1)
        wrapper.findWhere(predicateNextButton).simulate('click')
        expect(onChangePage).toHaveBeenLastCalledWith(3)
    })

    it('renders null when page first and no further records available', () => {
        store.getState().screen.bo.bc.bcExample = { ...bcExample, hasNext: false, page: 1 }
        const wrapper = mount(
            <Provider store={store}>
                <Pagination bcName="bcExample" mode={PaginationMode.page} />)
            </Provider>
        )
        expect(wrapper.find(Pagination).html()).toBe('')
    })

    it('handles missing bc', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Pagination bcName="bcMissing" mode={PaginationMode.page} />)
            </Provider>
        )
        expect(wrapper.find(Pagination))
    })
})

describe('`<Pagination />` loadMore mode', () => {
    let store: Store<CoreStore> = null
    const dispatch = jest.fn()

    beforeAll(() => {
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
        delete store.getState().screen.bo.bc.bcExample
    })

    it('renders Load More button', () => {
        store.getState().screen.bo.bc.bcExample = { ...bcExample, hasNext: true }
        const wrapper = mount(
            <Provider store={store}>
                <Pagination bcName="bcExample" mode={PaginationMode.loadMore} />)
            </Provider>
        )
        expect(wrapper.find(Button)).toHaveLength(1)
    })

    it('renders null when no further records available', () => {
        store.getState().screen.bo.bc.bcExample = { ...bcExample, hasNext: false }
        const wrapper = mount(
            <Provider store={store}>
                <Pagination bcName="bcExample" mode={PaginationMode.loadMore} />)
            </Provider>
        )
        expect(wrapper.find(Pagination).html()).toBe('')
    })

    it('disabled by spinner when loading', () => {
        store.getState().screen.bo.bc.bcExample = { ...bcExample, hasNext: true, loading: true }
        let wrapper = mount(
            <Provider store={store}>
                <Pagination bcName="bcExample" mode={PaginationMode.loadMore} />)
            </Provider>
        )
        expect(wrapper.find(Button).props().disabled).toBeTruthy()
        expect(wrapper.find(Button).props().loading).toBeTruthy()
        wrapper.find(Button).simulate('click')
        expect(dispatch).toHaveBeenCalledTimes(0)
        store.getState().screen.bo.bc.bcExample = { ...bcExample, hasNext: true, loading: false }
        wrapper = mount(
            <Provider store={store}>
                <Pagination bcName="bcExample" mode={PaginationMode.loadMore} />)
            </Provider>
        )
        expect(wrapper.find(Button).props().disabled).toBeFalsy()
        expect(wrapper.find(Button).props().loading).toBeFalsy()
        wrapper.find(Button).simulate('click')
        expect(dispatch).toHaveBeenCalledTimes(1)
    })

    it('fires `loadMore` action on click', () => {
        store.getState().screen.bo.bc.bcExample = { ...bcExample, hasNext: true, loading: false }
        const wrapper = mount(
            <Provider store={store}>
                <Pagination bcName="bcExample" mode={PaginationMode.loadMore} widgetName="widgetExample" />)
            </Provider>
        )
        wrapper.find(Button).simulate('click')
        expect(dispatch.mock.calls[0][0]).toEqual(
            expect.objectContaining(
                $do.bcLoadMore({
                    bcName: 'bcExample',
                    widgetName: 'widgetExample'
                })
            )
        )
    })

    it('fires optional `onChangePage` callback on click', () => {
        store.getState().screen.bo.bc.bcExample = { ...bcExample, hasNext: true, page: 9 }
        const onChangePage = jest.fn()
        const wrapper = mount(
            <Provider store={store}>
                <Pagination bcName="bcExample" mode={PaginationMode.loadMore} widgetName="widgetExample" onChangePage={onChangePage} />
            </Provider>
        )
        wrapper.find(Button).simulate('click')
        expect(onChangePage).toHaveBeenLastCalledWith(10)
    })
})

function predicatePrevButton(item: ReactWrapper<any, Readonly<Record<string, unknown>>>) {
    return item.type() === Button && item.props().icon === 'left'
}

function predicateNextButton(item: ReactWrapper<any, Readonly<Record<string, unknown>>>) {
    return item.type() === Button && item.props().icon === 'right'
}

const bcExample = { name: 'bcExample', parentName: null as string, url: null as string, cursor: null as string }
