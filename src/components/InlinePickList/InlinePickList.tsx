import React from 'react'
import { DataItem, PickMap } from '../../interfaces/data'
import ReadOnlyField from '../ui/ReadOnlyField/ReadOnlyField'
import { ChangeDataItemPayload, BaseFieldProps } from '../Field/Field'
import Select from '../ui/Select/Select'
import { $do } from '../../index'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Icon } from 'antd'
import styles from './InlinePickList.less'
import { Store } from '../../interfaces/store'
import { useDebounce } from '../../hooks/useDebounce'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'

interface InlinePickListOwnProps extends BaseFieldProps {
    fieldName: string
    searchSpec: string
    bcName: string
    popupBcName: string
    pickMap: PickMap
    value?: string
    placeholder?: string
}

interface InlinePickListProps extends InlinePickListOwnProps {
    data: DataItem[]
    onClick: (bcName: string, pickMap: PickMap, widgetName?: string) => void
    onChange: (payload: ChangeDataItemPayload) => void
    onSearch: (bcName: string, searchSpec: string, searchString: string) => void
}

/**
 *
 * @param props
 * @category Components
 */
const InlinePickList: React.FunctionComponent<InlinePickListProps> = props => {
    const { t } = useTranslation()

    if (props.readOnly) {
        return (
            <ReadOnlyField
                widgetName={props.widgetName}
                meta={props.meta}
                className={props.className}
                backgroundColor={props.backgroundColor}
                onDrillDown={props.onDrillDown}
            >
                {props.value}
            </ReadOnlyField>
        )
    }

    const [searchTerm, setSearchTerm] = React.useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    React.useEffect(() => {
        if (debouncedSearchTerm) {
            props.onSearch(props.popupBcName, props.searchSpec, searchTerm)
        }
    }, [debouncedSearchTerm])

    const handleClick = React.useCallback(() => {
        if (!props.disabled) {
            props.onClick(props.popupBcName, props.pickMap, props.widgetName)
        }
    }, [props.disabled, props.popupBcName, props.pickMap])

    const handleChange = React.useCallback(
        (valueKey: string) => {
            const row = props.data.find(item => item.id === valueKey)
            Object.keys(props.pickMap).forEach(field => {
                props.onChange({
                    bcName: props.bcName,
                    cursor: props.cursor,
                    dataItem: { [field]: row ? row[props.pickMap[field]] : '' }
                })
            })
        },
        [props.onChange, props.pickMap, props.bcName, props.cursor, props.data]
    )

    return (
        <span className={styles.inlinePickList}>
            <Select
                disabled={props.disabled}
                value={props.value}
                allowClear={!!props.value}
                showSearch
                placeholder={props.placeholder ?? t('Enter value')}
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={setSearchTerm}
                onChange={handleChange}
                notFoundContent={null}
                className={props.className}
            >
                {props.data.map(item => {
                    const title = item[props.pickMap[props.fieldName]] as string
                    return (
                        <Select.Option title={title} key={item.id} value={item.id}>
                            <span>{title}</span>
                        </Select.Option>
                    )
                })}
            </Select>
            <span
                className={cn(styles.buttonContainer, { [styles.disabledButton]: props.disabled })}
                onClick={!props.disabled ? handleClick : null}
            >
                <Icon type="paper-clip" />
            </span>
        </span>
    )
}

const emptyData: DataItem[] = []
function mapStateToProps(store: Store, ownProps: InlinePickListOwnProps) {
    return {
        data: store.data[ownProps.popupBcName] || emptyData
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    onChange: (payload: ChangeDataItemPayload) => {
        return dispatch($do.changeDataItem(payload))
    },
    onClick: (bcName: string, pickMap: PickMap, widgetName?: string) => {
        dispatch($do.showViewPopup({ bcName, widgetName }))
        dispatch($do.viewPutPickMap({ map: pickMap, bcName }))
    },
    onSearch: (bcName: string, searchSpec: string, searchString: string) => {
        dispatch($do.inlinePickListFetchDataRequest({ bcName, searchSpec, searchString }))
    }
})

/**
 * @category Components
 */
export default connect(mapStateToProps, mapDispatchToProps)(InlinePickList)
