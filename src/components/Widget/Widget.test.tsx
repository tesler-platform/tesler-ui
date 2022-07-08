import React, { FunctionComponent } from 'react'
import { mount, shallow } from 'enzyme'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import { Skeleton, Spin } from 'antd'
import { mockStore } from '../../tests/mockStore'
import { WidgetField, WidgetTypes, PopupWidgetTypes } from '../../interfaces/widget'
import { Store as CoreStore } from '../../interfaces/store'
import { $do } from '../../actions/actions'
import { BcMetaState } from '../../interfaces/bc'
import Form from '../widgets/FormWidget/FormWidget'
import Table from '../widgets/TableWidget/TableWidget'
import Widget, { Widget as SimpleWidget } from './Widget'
import styles from './Widget.less'
import AssocListPopup from '../widgets/AssocListPopup/AssocListPopup'
import PickListPopup from '../widgets/PickListPopup/PickListPopup'
import FlatTreePopup from '../widgets/FlatTree/FlatTreePopup'

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
        const card: FunctionComponent = props => <article className="blueCard">{props.children}</article>
        const wrapper = mount(
            <Provider store={store}>
                <Widget meta={widgetMeta} card={card} />
            </Provider>
        )
        const widget = wrapper.find(Widget)
        expect(widget.find('article.blueCard').length).toBe(1)
        expect(widget.find(`.${styles.container}`).length).toBe(0)
        expect(widget.find(Form).length).toBe(1)
    })

    it('should render Info widget', () => {
        const infoProps = { ...widgetMeta }
        infoProps.type = WidgetTypes.Info
        const wrapper = mount(
            <Provider store={store}>
                <Widget meta={infoProps} />
            </Provider>
        )
        expect(wrapper.find('Connect(InfoWidget)').length).toEqual(1)
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

    it('should not render when showCondition is false', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Widget
                    meta={{
                        ...widgetMeta,
                        showCondition: {
                            bcName: exampleBcName,
                            isDefault: false,
                            params: { fieldKey: 'test', value: 'never' }
                        }
                    }}
                />
            </Provider>
        )
        expect(wrapper.isEmptyRender()).toEqual(true)
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

describe('Uses info from widget descriptor', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.bo.bc[exampleBcName] = {} as BcMetaState
    })

    it('renders a custom component without card', () => {
        const component: FunctionComponent = () => <div className="customComponent" />

        const wrapper = mount(
            <Provider store={store}>
                <Widget meta={widgetMeta} customWidgets={{ [WidgetTypes.Form]: { component, card: null } }} />
            </Provider>
        )
        const widget = wrapper.find(Widget)
        expect(widget.find('div.customComponent').length).toBe(1)
        expect(widget.find(`.${styles.container}`).length).toBe(0)
    })

    it('renders a custom component with default card', () => {
        const component: FunctionComponent = () => <div className="customComponent" />

        const wrapper = mount(
            <Provider store={store}>
                <Widget meta={widgetMeta} customWidgets={{ [WidgetTypes.Form]: { component } }} />
            </Provider>
        )
        const widget = wrapper.find(Widget)
        expect(widget.find('div.customComponent').length).toBe(1)
        expect(widget.find(`.${styles.container}`).length).toBe(1)
    })

    it('renders custom card and custom component', () => {
        const card: FunctionComponent = props => <article className="blueCard">{props.children}</article>
        const component: FunctionComponent = () => <div className="customComponent" />

        const wrapper = mount(
            <Provider store={store}>
                <Widget meta={widgetMeta} customWidgets={{ [WidgetTypes.Form]: { component, card } }} />
            </Provider>
        )
        const widget = wrapper.find(Widget)
        expect(widget.find('article.blueCard').length).toBe(1)
        expect(widget.find('div.customComponent').length).toBe(1)
        expect(widget.find(`.${styles.container}`).length).toBe(0)
    })
})

describe('widget visibility', () => {
    let store: Store<CoreStore> = null
    type PopupWidgetsDictionary = {
        [key in typeof PopupWidgetTypes[number]]: React.ComponentType<any>
    }
    const widgetNames: PopupWidgetsDictionary = {
        AssocListPopup: AssocListPopup,
        PickListPopup: PickListPopup,
        FlatTreePopup: FlatTreePopup
    }

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.bo.bc[exampleBcName] = { parentName: 'parentBcExample' } as BcMetaState
        store.getState().screen.bo.bc.parentBcExample = {} as BcMetaState
        store.getState().popupData = { bcName: null }
    })

    afterEach(() => {
        store.getState().popupData = { bcName: null }
    })

    it('shows popup widgets only when they are opened', () => {
        PopupWidgetTypes.forEach(popupWidgetType => {
            const wrapper = mount(
                <Provider store={store}>
                    <Widget meta={{ ...widgetMeta, type: popupWidgetType }} />
                </Provider>
            )
            expect(wrapper.find(widgetNames[popupWidgetType]).length).toBe(0)
            store.dispatch($do.showViewPopup({ bcName: exampleBcName, widgetName: '1' }))
            wrapper.update()
            expect(wrapper.find(widgetNames[popupWidgetType]).length).toBe(1)
            store.dispatch($do.closeViewPopup(null))
            wrapper.update()
            expect(wrapper.find(widgetNames[popupWidgetType]).length).toBe(0)
        })
    })
})

describe('Widget spinner testing', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.bo.bc[exampleBcName] = {} as BcMetaState
        store.getState().data[exampleBcName] = [{ id: '11111', vstamp: 1 }]
        store.getState().screen.bo.bc[exampleBcName] = { ...store.getState().screen.bo.bc[exampleBcName], loading: true }
    })

    it('should render default spinner', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Widget meta={widgetMeta} />
            </Provider>
        )
        expect(wrapper.find(Spin).length).toBe(1)
    })

    it('should render custom spinner', () => {
        const customSpinner: React.FunctionComponent<{ props: any }> = props => {
            return <div>customLayout</div>
        }
        customSpinner.displayName = 'customSpinner'
        const wrapper = mount(
            <Provider store={store}>
                <Widget meta={widgetMeta} customSpinner={customSpinner} />
            </Provider>
        )
        expect(wrapper.find(customSpinner).length).toBe(1)
        expect(wrapper.find(Spin).length).toBe(0)
    })
})

describe('Choose widget', () => {
    it('render NavigationTabsWidget', () => {
        const wrapper = shallow(
            <SimpleWidget
                showWidget={true}
                rowMetaExists={true}
                dataExists={true}
                meta={{
                    ...widgetMeta,
                    type: WidgetTypes.NavigationTabs
                }}
            />
        )
        expect(wrapper.find('Memo(NavigationTabsWidget)').length).toBe(1)
    })

    it('should render children', () => {
        const wrapper = shallow(
            <SimpleWidget
                showWidget={true}
                rowMetaExists={true}
                dataExists={true}
                meta={{
                    ...widgetMeta,
                    type: WidgetTypes.ViewNavigation
                }}
            >
                <div className="SimpleWidgetChild">SimpleWidgetChild</div>
            </SimpleWidget>
        )
        expect(wrapper.find('.SimpleWidgetChild').length).toBe(1)
    })

    it('should render FlatTree', () => {
        const wrapper = shallow(
            <SimpleWidget
                showWidget={true}
                rowMetaExists={true}
                dataExists={true}
                meta={{
                    ...widgetMeta,
                    title: 'FlatTree!',
                    type: WidgetTypes.FlatTree
                }}
            />
        )
        expect(wrapper.find('Memo()').findWhere(i => i.props().meta.type === WidgetTypes.FlatTree).length).toBe(1)
    })

    it('should render TextWidget', () => {
        const wrapper = shallow(
            <SimpleWidget
                showWidget={true}
                rowMetaExists={true}
                dataExists={true}
                meta={{
                    ...widgetMeta,
                    title: 'Text!',
                    type: WidgetTypes.Text
                }}
            />
        )
        expect(wrapper.find('TextWidget').length).toBe(1)
    })
})

describe('Custom widget debug panel', () => {
    let store: Store<CoreStore> = null

    const widgetCustomMeta = {
        id: '1',
        name: '1',
        type: 'MyCustom',
        title: 'MyCustom title',
        bcName: exampleBcName,
        position: 1,
        gridWidth: 1,
        fields: [] as WidgetField[]
    }

    function MyCustom() {
        return <div>custom widget</div>
    }

    function MyCard({ children }: { children: any }) {
        return <div>{children}</div>
    }

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.bo.bc[exampleBcName] = {} as BcMetaState
        store.getState().data[exampleBcName] = [{ id: '11111', vstamp: 1 }]
        store.getState().session.debugMode = true
        store.getState().view.widgets = [widgetCustomMeta]
    })

    it('should show debug panel for custom widget WITHOUT custom card', function () {
        const wrapper = mount(
            <Provider store={store}>
                <Widget meta={widgetCustomMeta} customWidgets={{ MyCustom: MyCustom }} />
            </Provider>
        )

        expect(wrapper.find('Memo(DebugPanel)').length).toBe(1)
    })

    it('should show debug panel for custom widget WITH custom card', function () {
        const wrapper = mount(
            <Provider store={store}>
                <Widget meta={widgetCustomMeta} customWidgets={{ MyCustom: MyCustom }} card={MyCard} />
            </Provider>
        )

        expect(wrapper.find('Memo(DebugPanel)').length).toBe(1)
        expect(wrapper.find('MyCard').length).toBe(1)
    })
})
