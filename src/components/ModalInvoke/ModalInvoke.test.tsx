import { Store } from 'redux'
import { Store as CoreStore } from '../../interfaces/store'
import { mockStore } from '../../tests/mockStore'
import { mount, shallow } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'
import ModalInvoke from './ModalInvoke'
import { Modal } from 'antd'
import { OperationPostInvokeConfirmType, OperationPreInvokeType } from '../../interfaces/operation'

const operationData = {
    bcName: 'bcName',
    operationType: 'someOperation',
    widgetName: 'widgetName'
}
describe('ModalInvoke test', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })

    afterEach(() => {
        store.getState().view.modalInvoke = null
    })

    it('should render with default title', () => {
        store.getState().view.modalInvoke = {
            operation: operationData,
            confirmOperation: {
                type: 'confirm',
                message: 'some message'
            }
        }
        const wrapper = mount(
            <Provider store={store}>
                <ModalInvoke />
            </Provider>
        )
        expect(wrapper.find(Modal).findWhere(i => i.props().title === 'Are you sure?').length).toBeGreaterThan(0)
    })
    it('should render with custom title', () => {
        store.getState().view.modalInvoke = {
            operation: operationData,
            confirmOperation: {
                okText: 'custom ok text',
                cancelText: 'custom cancel',
                type: 'confirm',
                messageContent: 'Message Title',
                message: 'some message'
            }
        }
        const wrapper = mount(
            <Provider store={store}>
                <ModalInvoke />
            </Provider>
        )
        expect(wrapper.find(Modal).findWhere(i => i.props().title === 'Are you sure?').length).toBe(0)
        expect(
            wrapper
                .find(Modal)
                .findWhere(
                    i =>
                        i.props().title === 'Message Title' &&
                        i.props().okText === 'custom ok text' &&
                        i.props().cancelText === 'custom cancel'
                ).length
        ).toBeGreaterThan(0)
    })
    it('should render with confirmText', () => {
        store.getState().view.modalInvoke = {
            operation: operationData,
            confirmOperation: {
                type: OperationPostInvokeConfirmType.confirmText,
                message: 'some message'
            }
        }
        const wrapper = mount(
            <Provider store={store}>
                <ModalInvoke />
            </Provider>
        )
        expect(wrapper.find(Modal).findWhere(i => i.props().title === 'Are you sure?').length).toBeGreaterThan(0)
        expect(wrapper.find('.multiline').findWhere(i => i.text() === 'some message').length).toBeGreaterThan(0)
        expect(wrapper.find('Input').length).toBe(1)
    })
    it('should call Modal.info', () => {
        store.getState().view.modalInvoke = {
            operation: operationData,
            confirmOperation: {
                type: OperationPreInvokeType.info,
                message: 'some message'
            }
        }
        const wrapper = mount(
            <Provider store={store}>
                <ModalInvoke />
            </Provider>
        )
        expect(wrapper.find('ModalInvoke').findWhere(i => i.props().confirmOperation.type === OperationPreInvokeType.info).length).toBe(1)
    })
    it('should call Modal.error', () => {
        store.getState().view.modalInvoke = {
            operation: operationData,
            confirmOperation: {
                type: OperationPreInvokeType.error,
                message: 'some message'
            }
        }
        const wrapper = mount(
            <Provider store={store}>
                <ModalInvoke />
            </Provider>
        )
        expect(wrapper.find('ModalInvoke').findWhere(i => i.props().confirmOperation.type === OperationPreInvokeType.error).length).toBe(1)
    })
    it('should handle Ok click', () => {
        const dispatch = jest.fn()
        const mock = jest.spyOn(store, 'dispatch').mockImplementation(action => {
            return dispatch(action)
        })
        store.getState().view.modalInvoke = {
            operation: operationData,
            confirmOperation: {
                type: 'confirm',
                message: 'some message'
            }
        }
        const wrapper = mount(
            <Provider store={store}>
                <ModalInvoke />
            </Provider>
        )
        const okButton = wrapper.find('.ant-btn.ant-btn-primary')
        expect(okButton.length).toBeGreaterThan(0)
        okButton.simulate('click')
        expect(dispatch).toBeCalledTimes(2)
        mock.mockRestore()
    })
    it('should handle cancel click', () => {
        const dispatch = jest.fn()
        const mock = jest.spyOn(store, 'dispatch').mockImplementation(action => {
            return dispatch(action)
        })
        store.getState().view.modalInvoke = {
            operation: operationData,
            confirmOperation: {
                type: 'confirm',
                message: 'some message'
            }
        }
        const wrapper = mount(
            <Provider store={store}>
                <ModalInvoke />
            </Provider>
        )
        const cancelButton = wrapper.find('button').findWhere(i => i.text() === 'Cancel')
        const cancelButtonWrapper = shallow(cancelButton.get(0))
        cancelButtonWrapper.simulate('click')
        expect(dispatch).toBeCalledTimes(1)
        mock.mockRestore()
    })
})
