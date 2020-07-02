import React, {FormEvent, FunctionComponent} from 'react'
import {Popover, Checkbox, Input, Button, Form, Icon, DatePicker} from 'antd'
import {connect} from 'react-redux'
import {RowMetaField} from '../../interfaces/rowMeta'
import {MultivalueFieldMeta, WidgetField, WidgetListField, WidgetMeta} from '../../interfaces/widget'
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
import {Moment} from 'moment'

export interface ColumnFilterOwnProps {
    widgetName: string,
    widgetMeta: WidgetListField,
    rowMeta: RowMetaField
}

export interface ColumnFilterProps extends ColumnFilterOwnProps {
    bcName: string,
    filter: BcFilter,
    widget: WidgetMeta,
    onApply: (bcName: string, filter: BcFilter) => void,
    onCancel: (bcName: string, filter: BcFilter) => void,
    onMultivalueAssocOpen: (bcName: string, calleeBCName: string, assocValueKey: string, associateFieldKey: string) => void,
}

export const ColumnFilter: FunctionComponent<ColumnFilterProps> = (props) => {

    const filter = props.filter
    const [value, setValue] = React.useState(filter ? filter.value : null)
    const [visible, setVisible] = React.useState(false)

    React.useEffect(
        () => {
            setValue(filter ? filter.value : null)
        },
        [filter]
    )

    const handleVisibleChange = () => {
        setVisible((prevVisibleState) => !prevVisibleState)
    }

    const handleInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const textValue = e.target.value.substr(0, 100)
        setValue(textValue || null)
    }

    const handleDateValue = (date: Moment, dateString: string) => {
        setValue(dateString || null)
    }

    const handlePopup = (bcName: string, calleeBCName: string, assocValueKey: string, associateFieldKey: string) => {
        props.onMultivalueAssocOpen(bcName, calleeBCName, assocValueKey, associateFieldKey)
        handleVisibleChange()
    }

    const handleCheckboxValue = (e: CheckboxChangeEvent) => {
        setValue(e.target.value || null)
    }

    const handleApply = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setVisible(false)
        let type: FilterType
        switch (props.widgetMeta.type) {
            case(FieldType.dictionary): {
                type = FilterType.equalsOneOf
                break
            }
            case(FieldType.checkbox): {
                type = FilterType.specified
                break
            }
            case(FieldType.date):
            case(FieldType.number):
            case(FieldType.pickList):
            case(FieldType.multivalue): {
                type = FilterType.equals
                break
            }
            case(FieldType.input):
            case(FieldType.text): {
                type = FilterType.contains
                break
            }
            default:
                type = FilterType.equals
        }

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

    const handleCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        setVisible(false)
        if (props.filter) {
            props.onCancel(props.bcName, filter)
        }
    }

    let columnFilterPopover
    switch (props.widgetMeta.type) {
        case (FieldType.dictionary) :
        case (FieldType.pickList) : {
            columnFilterPopover =
                renderCheckbox(props.widgetMeta.title, value as DataValue[], props.rowMeta.filterValues, setValue)
            break
        }
        case (FieldType.checkbox) : {
            columnFilterPopover =
                <Checkbox onChange={handleCheckboxValue}/>
            break
        }
        case (FieldType.input) :
        case (FieldType.text) :
        case (FieldType.number) : {
            columnFilterPopover =
                <Input
                    autoFocus
                    value={value as string}
                    suffix={<Icon type="search"/>}
                    onChange={handleInputValue}/>
            break
        }
        case (FieldType.date) : {
            columnFilterPopover =
                <DatePicker
                    autoFocus
                    onChange={handleDateValue}
                    format={'YYYY-MM-DD' + 'T' + 'HH:mm:SS'}/>
            break
        }
    }

    const {t} = useTranslation()

    const fieldMeta = props.widget?.fields.find((field: WidgetField) => field.key === props.widgetMeta.key) as MultivalueFieldMeta
    const isMultivalue = props.widgetMeta.type === FieldType.multivalue
    React.useEffect(() => {
        if (isMultivalue  && visible) {
            handlePopup(fieldMeta.popupBcName, props.bcName, fieldMeta.assocValueKey, fieldMeta.associateFieldKey)
        }
    }, [isMultivalue, visible, props.bcName, fieldMeta])

    const content = isMultivalue ? undefined
        : <div className={styles.content}>
        <Form onSubmit={handleApply} layout="vertical">
            {columnFilterPopover}
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
        visible={visible && props.widgetMeta.type !== FieldType.multivalue}
        onVisibleChange={handleVisibleChange}
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
                indeterminate={value?.length > 0 && value?.length < filterValues.length}
                checked={value?.length === filterValues.length}
                onChange={handleAll}
            />
            {title}
        </li>
        <ul className={styles.list}>
            {filterValues.map((item, index) => {
                const checked = value?.some(filterValue => item.value === filterValue)
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
    const bcName = widget?.bcName
    const filter = store.screen.filters[bcName]?.find(item => item.fieldName === ownProps.widgetMeta.key)
    return {
        widget,
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
        },
        onMultivalueAssocOpen: (bcName: string, calleeBCName: string, assocValueKey: string, associateFieldKey: string) => {
            dispatch($do.showViewPopup({
                bcName: bcName,
                calleeBCName: calleeBCName,
                assocValueKey: assocValueKey,
                associateFieldKey: associateFieldKey,
                isFilter: true
            }))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ColumnFilter)
