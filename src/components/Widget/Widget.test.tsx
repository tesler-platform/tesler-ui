import React, {FunctionComponent} from 'react'
import {mount, shallow} from 'enzyme'
import {Store} from 'redux'
import {Provider} from 'react-redux'
import {Skeleton} from 'antd'
import {mockStore} from '../../tests/mockStore'
import {WidgetTypes, WidgetField} from '../../interfaces/widget'
import {Store as CoreStore} from '../../interfaces/store'
import {$do} from '../../actions/actions'
import {BcMetaState} from '../../interfaces/bc'
import Form from '../widgets/FormWidget/FormWidget'
import Table from '../widgets/TableWidget/TableWidget'
import Widget, {Widget as SimpleWidget} from './Widget'
import styles from './Widget.less'

const exampleBcName = 'bcExample'
const widgetMeta = {
    id: '1',
    name: '1',
    type: WidgetTypes.Form,
    title: 'Form',
    bcName: exampleBcName,
    position: 1,
    gridWidth: 1,
    fields: [] as WidgetField[]
}

describe('Field with default card', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.bo.bc[exampleBcName] = {} as BcMetaState
    })

    it('renders default card wrapper', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Widget meta={widgetMeta} />
            </Provider>
        )
        const widget = wrapper.find(Widget)
        expect(widget.find(`.${styles.container}`).length).toBe(1)
        expect(widget.find(Form).length).toBe(1)
    })

    it('renders custom card wrapper', () => {
        const card: FunctionComponent = props =>
            <article className="blueCard">
                {props.children}
            </article>
        const wrapper = mount(
            <Provider store={store}>
                <Widget meta={widgetMeta} card={card} />
            </Provider>
        )
        const widget = wrapper.find(Widget)
        expect(widget.find(`article.blueCard`).length).toBe(1)
        expect(widget.find(`.${styles.container}`).length).toBe(0)
        expect(widget.find(Form).length).toBe(1)
    })

    it('shows skeleton loader when fetching data', () => {
        const { bcName, name: widgetName } = widgetMeta
        const wrapper = mount(
            <Provider store={store}>
                <Widget meta={widgetMeta} />
            </Provider>
        )
        const widgetBefore = wrapper.find(Widget)
        expect(widgetBefore.find(Skeleton).length).toBe(0)
        store.dispatch($do.bcFetchDataRequest({ bcName, widgetName }))
        expect(store.getState().screen.bo.bc[exampleBcName].loading).toBe(true)
        wrapper.update()
        const widgetAfter = wrapper.find(Widget)
        expect(widgetAfter.find(Skeleton).length).toBe(1)
    })
})

describe('Determine widget component', () => {
    it('should use custom component when core widget type overriden', () => {
        const wrapper = shallow(
            <SimpleWidget
                meta={widgetMeta}
                customWidgets={{
                    [WidgetTypes.Form]: Table
                }}
                showWidget
                dataExists
                rowMetaExists
            />
        )
        expect(wrapper.find(Form).length).toBe(0)
        expect(wrapper.find(Table).length).toBe(1)
    })
})
