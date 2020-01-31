import React from 'react'
import {connect} from 'react-redux'
import {Skeleton, Spin} from 'antd'
import {Store} from '../../interfaces/store'
import {
    WidgetMeta,
    WidgetTypes,
    WidgetFormMeta,
    WidgetTableMeta,
    CustomWidget,
    WidgetShowCondition,
    WidgetTextMeta
} from '../../interfaces/widget'
import TableWidget from '../widgets/TableWidget/TableWidget'
import TextWidget from '../widgets/TextWidget/TextWidget'
import FormWidget from '../widgets/FormWidget/FormWidget'
import styles from './Widget.less'
import AssocListPopup from '../widgets/AssocListPopup/AssocListPopup'
import {ObjectMap} from '../../interfaces/objectMap'
import PickListPopup from '../widgets/PickListPopup/PickListPopup'
import {BcMetaState} from '../../interfaces/bc'
import {ViewState} from '../../interfaces/view'
import {DataState} from '../../interfaces/data'
import {buildBcUrl} from '../../utils/strings'

interface WidgetOwnProps {
    meta: WidgetMeta,
    card?: (props: any) => React.ReactElement<any>,
    children?: React.ReactNode,
}

interface WidgetProps extends WidgetOwnProps {
    loading?: boolean,
    parentCursor?: string,
    customWidgets?: ObjectMap<CustomWidget>,
    showWidget: boolean,
    rowMetaExists: boolean,
    dataExists: boolean
}

const skeletonParams = { rows: 5 }

export function Widget(props: WidgetProps) {
    if (!props.showWidget) {
        return null
    }
    if (props.meta.type === WidgetTypes.AssocListPopup) {
        return <AssocListPopup widget={props.meta as WidgetTableMeta} />
    }
    if (props.meta.type === WidgetTypes.PickListPopup) {
        return <PickListPopup widget={props.meta as WidgetTableMeta} />
    }

    const showSpinner = !!(props.loading && (props.rowMetaExists || props.dataExists))
    const showSkeleton = props.loading && !showSpinner

    if (props.card) {
        const Card = props.card
        return <Card meta={props.meta}>
            { showSkeleton && <Skeleton loading paragraph={skeletonParams} /> }
            { !showSkeleton &&
                <Spin spinning={showSpinner}>
                    {chooseWidgetType(props.meta, props.customWidgets, props.children)}
                </Spin>
            }
        </Card>
    }
    return <div className={styles.container}>
        <h2 className={styles.title}>{props.meta.title}</h2>
        { showSkeleton && <Skeleton loading paragraph={skeletonParams} /> }
        { !showSkeleton &&
            <Spin spinning={showSpinner}>
                {chooseWidgetType(props.meta, props.customWidgets, props.children)}
            </Spin>
        }
    </div>
}

/**
 * Возвращает экземпляр компонента виджета на основе типа, который пришел в мете виджета.
 *
 * Словарь customWidgets может использоваться для расширения новыми типами виджетов, при этом
 * если в словаре переопределен один из стандартных типов виджета, то приоритет будет за тем компонентом,
 * что пришел в словаре.
 * В случае неизвестного типа виджета, будет возвращен children.
 *
 * @param widgetMeta Мета виджета
 * @param customWidgets Словарь, где ключ - тип виджета, значение - экземпляр компонента, которым этот виджет нужно рендерить
 * @param children Дочерние компоненты виджета, возвращаются при неизвестном типе виджета
 */
function chooseWidgetType(widgetMeta: WidgetMeta, customWidgets?: ObjectMap<CustomWidget>, children?: React.ReactNode) {
    const options = widgetMeta.options
    const readOnly = options && options.readOnly
    if (customWidgets && customWidgets[widgetMeta.type]) {
        const CustomWidgetComponent = customWidgets[widgetMeta.type]
        return <CustomWidgetComponent meta={widgetMeta} />
    }
    switch (widgetMeta.type) {
        case WidgetTypes.List:
        case WidgetTypes.DataGrid:
            return <TableWidget
                meta={widgetMeta as WidgetTableMeta}
                showRowActions
                allowEdit={!readOnly}
            />
        case WidgetTypes.Form:
            return <FormWidget meta={widgetMeta as WidgetFormMeta} />
        case WidgetTypes.Text:
            return <TextWidget meta={widgetMeta as WidgetTextMeta} />
        default:
            return children
    }
}

function mapStateToProps(store: Store, ownProps: WidgetOwnProps) {
    const bcName = ownProps.meta.bcName
    const bc = store.screen.bo.bc[bcName]
    const parent = bc && store.screen.bo.bc[bc.parentName]
    const hasParent = !!parent
    let showWidget = true
    if (ownProps.meta.showCondition && !Array.isArray(ownProps.meta.showCondition)) {
        showWidget = checkShowCondition(ownProps.meta.showCondition, store.screen.bo.bc, store.data, store.view)
    }
    const bcUrl = buildBcUrl(bcName, true)
    const rowMeta = bcUrl
        && store.view.rowMeta[bcName]
        && store.view.rowMeta[bcName][bcUrl]
    return {
        loading: bc && bc.loading,
        parentCursor: hasParent && parent.cursor,
        showWidget,
        rowMetaExists: !!rowMeta,
        dataExists: !!store.data[bcName]
    }
}

function checkShowCondition(condition: WidgetShowCondition, bcMap: Record<string, BcMetaState>, data: DataState, view: ViewState) {
    const { bcName, isDefault, params } = condition
    if (isDefault) {
        return true
    }
    const cursor = bcMap[bcName] && bcMap[bcName].cursor
    const record = cursor && data[bcName] && data[bcName].find(item => item.id === cursor)
    const actualValue = record && record[params.fieldKey]
    const pendingValue = view.pendingDataChanges[bcName]
        && view.pendingDataChanges[bcName][cursor]
        && view.pendingDataChanges[bcName][cursor][params.fieldKey]
    return (pendingValue !== undefined)
        ? pendingValue === params.value
        : actualValue === params.value
}

export default connect(mapStateToProps)(Widget)
