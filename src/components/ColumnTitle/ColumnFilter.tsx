import React from 'react'
import { Popover } from 'antd'
import { connect, useDispatch, useSelector } from 'react-redux'
import { RowMetaField } from '../../interfaces/rowMeta'
import { MultivalueFieldMeta, WidgetField, WidgetListField, WidgetMeta } from '../../interfaces/widget'
import styles from './ColumnFilter.less'
import { $do } from '../../actions/actions'
import { Store } from '../../interfaces/store'
import { BcFilter } from '../../interfaces/filters'
import { FieldType } from '../../interfaces/view'
import cn from 'classnames'
import filterIcon from './filter-solid.svg'
import FilterPopup from '../FilterPopup/FilterPopup'
import FilterField from '../ui/FilterField/FilterField'
import { PickListFieldMeta, WidgetTypes } from '@tesler-ui/schema'

export interface ColumnFilterOwnProps {
    widgetName: string
    widgetMeta: WidgetListField
    rowMeta: RowMetaField
}

export interface ColumnFilterProps extends ColumnFilterOwnProps {
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of widget
     */
    bcName?: string
    filter: BcFilter
    widget: WidgetMeta
    components?: {
        popup: React.ReactNode
    }
    /**
     * @deprecated TODO: Remove in 2.0.0, handled by ColumnFilterPopup now
     */
    onApply?: (bcName: string, filter: BcFilter) => void
    /**
     * @deprecated TODO: Remove in 2.0.0, handled by ColumnFilterPopup now
     */
    onCancel?: (bcName: string, filter: BcFilter) => void
    /**
     * @deprecated TODO: Remove in 2.0.0, handled internally
     */
    onMultivalueAssocOpen?: (bcName: string, calleeBCName: string, assocValueKey: string, associateFieldKey: string) => void
}

export const ColumnFilter: React.FC<ColumnFilterProps> = props => {
    const [value, setValue] = React.useState(props.filter?.value)
    const [visible, setVisible] = React.useState(false)
    const dispatch = useDispatch()

    React.useEffect(() => {
        setValue(props.filter?.value)
    }, [props.filter?.value])

    const assocWidget = useSelector((store: Store) =>
        store.view.widgets.find(
            item => item.bcName === (props.widgetMeta as PickListFieldMeta).popupBcName && item.type === WidgetTypes.AssocListPopup
        )
    )

    const isPickList = props.widgetMeta.type === FieldType.pickList
    const isMultivalue = [FieldType.multivalue, FieldType.multivalueHover].includes(props.widgetMeta.type) || isPickList

    const fieldMeta = props.widget?.fields.find((field: WidgetField) => field.key === props.widgetMeta.key) as
        | MultivalueFieldMeta
        | PickListFieldMeta
    const fieldMetaMultivalue = fieldMeta as MultivalueFieldMeta
    const fieldMetaPickListField = fieldMeta as PickListFieldMeta
    const handleVisibleChange = (eventVisible: boolean) => {
        if (isMultivalue && eventVisible) {
            setVisible(false)
            dispatch(
                $do.showViewPopup({
                    bcName: fieldMeta.popupBcName,
                    widgetName: assocWidget?.name,
                    calleeBCName: props.widget?.bcName,
                    calleeWidgetName: props.widget?.name,
                    assocValueKey: !isPickList ? fieldMetaMultivalue.assocValueKey : fieldMetaPickListField.pickMap[fieldMeta.key],
                    associateFieldKey: !isPickList ? fieldMetaMultivalue.associateFieldKey : fieldMeta.key,
                    isFilter: true
                })
            )
        } else {
            setVisible(!visible)
        }
    }

    const content = props.components?.popup ?? (
        <FilterPopup
            widgetName={props.widgetName}
            fieldKey={props.widgetMeta.key}
            value={value}
            onApply={() => {
                setVisible(false)
            }}
            onCancel={() => {
                setVisible(false)
            }}
        >
            <FilterField widgetFieldMeta={props.widgetMeta} rowFieldMeta={props.rowMeta} value={value} onChange={setValue} />
        </FilterPopup>
    )

    return (
        <Popover
            trigger="click"
            content={!isMultivalue && content}
            visible={!isMultivalue && visible}
            onVisibleChange={handleVisibleChange}
        >
            <div
                className={cn(styles.icon, { [styles.active]: props.filter?.value?.toString()?.length > 0 })}
                dangerouslySetInnerHTML={{ __html: filterIcon }}
            />
        </Popover>
    )
}

/**
 * Create ColumnFilter props
 *
 * @param store Store instance for read-only access of different branches of Redux store
 * @param ownProps ColumnFilter component props
 */
export function mapStateToProps(store: Store, ownProps: ColumnFilterOwnProps) {
    const widget = store.view.widgets.find(item => item.name === ownProps.widgetName)
    const bcName = widget?.bcName
    const filter = store.screen.filters[bcName]?.find(item => item.fieldName === ownProps.widgetMeta.key)
    return {
        widget,
        filter,
        bcName
    }
}

/**
 * @category Components
 */
export default connect(mapStateToProps)(ColumnFilter)
