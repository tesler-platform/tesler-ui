import React from 'react'
import { Button } from 'antd'
import RowOperationsButton from '../RowOperationsButton'
import { mockStore } from '../../../tests/mockStore'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { useRowMenu } from '../../../hooks/useRowMenu'
import { WidgetTypes } from '@tesler-ui/schema'
import { WidgetTableMeta } from '../../../interfaces/widget'
import { mount } from 'enzyme'
import styles from '../RowOperationsButton.less'
import { $do } from '../../../actions/actions'
import { RowOperationsMenu } from '../RowOperationsMenu'

describe(`<RowOperationsButton />`, () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })

    it('renders', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Component />
            </Provider>
        )
        const button = wrapper.findWhere(item => item.name() === Button.name && item.hasClass(styles.dots))
        expect(wrapper.find(RowOperationsButton).length).toBe(1)
        expect(wrapper.find(`.${styles.floatMenu}`).length).toBe(1)
        expect(button.length).toBe(1)
    })

    it('toggles display on hover', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Component />
            </Provider>
        )
        const button = wrapper.find(`.${styles.floatMenu}`).getDOMNode()
        expect(button).toHaveProperty('style.display', '')
        expect(button).toHaveProperty('style.top', '')
        wrapper.find('#first').simulate('mouseleave')
        wrapper.find('#second').simulate('mouseenter')
        expect(button).toHaveProperty('style.display', 'block')
        expect(button).toHaveProperty('style.top', '17px')
        wrapper.find('#second').simulate('mouseleave')
        wrapper.find('#farRealms').simulate('mouseenter')
        expect(button).toHaveProperty('style.display', 'none')
    })

    it('fires `bcSelectRecord` and shows `<RowOperationsMenu />` on click', () => {
        const mockDispatch = jest.fn()
        const wrapper = mount(
            <Provider store={{ ...store, dispatch: mockDispatch }}>
                <Component />
            </Provider>
        )
        const seniorButton = wrapper.find(`.${styles.floatMenu}`).getDOMNode()
        const button = wrapper.findWhere(item => item.name() === Button.name && item.hasClass(styles.dots))
        expect(mockDispatch).toBeCalledTimes(0)
        expect(wrapper.find(RowOperationsMenu).length).toBe(0)
        wrapper.find('#second').simulate('mouseenter')
        button.simulate('click')
        expect(mockDispatch).toBeCalledWith(
            expect.objectContaining(
                $do.bcSelectRecord({
                    bcName: 'bcExample',
                    cursor: '2'
                })
            )
        )
        expect(wrapper.find(RowOperationsMenu).length).toBe(1)
        wrapper.find('#second').simulate('mouseleave')
        wrapper.find('#farRealms').simulate('mouseenter')
        expect(seniorButton).toHaveProperty('style.display', 'block')
    })
})

const Component: React.FC = () => {
    const [operationsRef, tableRef, onHover] = useRowMenu()
    const { onMouseEnter: onMouseEnter1, onMouseLeave: onMouseLeave1 } = onHover({ id: '1', vstamp: 0 })
    const { onMouseEnter: onMouseEnter2, onMouseLeave: onMouseLeave2 } = onHover({ id: '2', vstamp: 0 })
    return (
        <div>
            <div ref={tableRef}>
                <table>
                    <tbody>
                        <tr id="first" onMouseEnter={onMouseEnter1} onMouseLeave={onMouseLeave1}>
                            <td>First</td>
                        </tr>
                        <tr id="second" onMouseEnter={onMouseEnter2} onMouseLeave={onMouseLeave2}>
                            <td>Second</td>
                        </tr>
                    </tbody>
                </table>
                <RowOperationsButton ref={operationsRef} parent={tableRef} meta={hierarchyWidget} />
            </div>
            <div id="farRealms">Here be dragons</div>
        </div>
    )
}

const hierarchyWidget: WidgetTableMeta = {
    bcName: 'bcExample',
    name: 'widget-example',
    type: WidgetTypes.List,
    title: '',
    position: 0,
    gridWidth: 0,
    fields: [],
    options: {
        hierarchy: [
            {
                bcName: 'bcChild',
                fields: []
            }
        ]
    }
}
