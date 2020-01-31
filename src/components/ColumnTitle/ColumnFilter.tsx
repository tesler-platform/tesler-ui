import React, {FunctionComponent} from 'react'
import {Popover, Checkbox, Input, Button, Form, Icon} from 'antd'
import {connect} from 'react-redux'
import {RowMetaField} from '../../interfaces/rowMeta'
import {WidgetListField} from '../../interfaces/widget'
import styles from './ColumnFilter.less'
import {$do} from '../../actions/actions'
import {Store} from '../../interfaces/store'
import {BcFilter, FilterType} from '../../interfaces/filters'
import {FieldType} from '../../interfaces/view'
import {Dispatch} from 'redux'
import {DataValue} from '../../interfaces/data'
import {CheckboxChangeEvent} from 'antd/lib/checkbox'
import cn from 'classnames'
import filterIcon from './filter-solid.svg'
import {useTranslation} from 'react-i18next'

export interface ColumnFilterOwnProps {
    widgetName: string,
    widgetMeta: WidgetListField,
    rowMeta: RowMetaField
}

export interface ColumnFilterProps extends ColumnFilterOwnProps {
    bcName: string,
    filter: BcFilter,
    onApply: (bcName: string, filter: BcFilter) => void,
    onCancel: (bcName: string, filter: BcFilter) => void
}

export const ColumnFilter: FunctionComponent<ColumnFilterProps> = (props) => {
    const {t} = useTranslation()
    const filter = props.filter
    const [value, setValue] = React.useState(filter ? filter.value : null)

    const handleInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value || null)
    }

    const handleApply = () => {
        const type = props.widgetMeta.type === FieldType.dictionary
            ? FilterType.equalsOneOf
            : FilterType.contains
        const newFilter: BcFilter = {
            type,
            value,
            fieldName: props.widgetMeta.key
        }
        if (!value) {
            props.onCancel(props.bcName, filter)
        } else {
            props.onApply(props.bcName, newFilter)
        }
    }

    const handleCancel = () => {
        if (props.filter) {
            props.onCancel(props.bcName, filter)
        }
    }

    const content = <div className={styles.content}>
        <Form onSubmit={handleApply} layout="vertical">
            { props.widgetMeta.type === FieldType.dictionary &&
                renderCheckbox(props.widgetMeta.title, value as DataValue[], props.rowMeta.filterValues, setValue)
            }
            { props.widgetMeta.type !== FieldType.dictionary &&
                <Input
                    autoFocus
                    value={value as string}
                    suffix={<Icon type="search" />}
                    onChange={handleInputValue}
                />
            }
            <div className={styles.operators}>
                <Button className={styles.button} htmlType="submit">
                    {t('Apply')}
                </Button>
                <Button className={styles.button} onClick={handleCancel}>
                    {t('Clear')}
                </Button>
            </div>
        </Form>
    </div>

    return <Popover
        trigger="click"
        content={content}
    >
        <div
            className={cn(styles.icon, { [styles.active]: !!filter })}
            dangerouslySetInnerHTML={{ __html: filterIcon }}
        />
    </Popover>
}

/**
 * TODO
 *
 * @param title 
 * @param value 
 * @param filterValues 
 * @param setValue 
 */
function renderCheckbox(
    title: string,
    value: DataValue[],
    filterValues: Array<{ value: string }>,
    setValue: React.Dispatch<DataValue[]>
) {
    const handleCheckbox = (e: CheckboxChangeEvent) => {
        const prevValues = value as DataValue[] || []
        const newValues = e.target.checked
            ? [ ...prevValues, e.target.value ]
            : prevValues.filter(item => item !== e.target.value)
        setValue(newValues.length ? newValues : null)
    }

    const handleAll = (e: CheckboxChangeEvent) => {
        const newValues = e.target.checked
            ? filterValues.map(item => item.value)
            : null
        setValue(newValues)
    }
    return <div>
        <li className={cn(styles.listItem, styles.header)}>
            <Checkbox
                className={styles.checkbox}
                indeterminate={value && value.length > 0 && value.length < filterValues.length}
                checked={value && value.length === filterValues.length}
                onChange={handleAll}
            />
            {title}
        </li>
        <ul className={styles.list}>
            {filterValues.map((item, index) => {
                const checked = value && value.some(filterValue => item.value === filterValue)
                return <li className={styles.listItem} key={index}>
                    <Checkbox
                        checked={checked}
                        className={styles.checkbox}
                        value={item.value}
                        onChange={handleCheckbox}
                    />
                    {item.value}
                </li>
            })}
        </ul>
    </div>
}

function mapStateToProps(store: Store, ownProps: ColumnFilterOwnProps) {
    const widget = store.view.widgets.find(item => item.name === ownProps.widgetName)
    const bcName = widget && widget.bcName
    const filter = store.screen.filters[bcName] && store.screen.filters[bcName].find(item => item.fieldName === ownProps.widgetMeta.key)
    return {
        filter,
        bcName
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onApply: (bcName: string, filter: BcFilter) => {
            dispatch($do.bcAddFilter({ bcName, filter }))
            dispatch($do.bcForceUpdate({ bcName }))
        },
        onCancel: (bcName: string, filter: BcFilter) => {
            dispatch($do.bcRemoveFilter({ bcName, filter }))
            dispatch($do.bcForceUpdate({ bcName }))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ColumnFilter)
