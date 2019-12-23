import React from 'react'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import {Checkbox} from 'antd'
import {CheckboxChangeEvent} from 'antd/es/checkbox'
import {Store} from '../../../interfaces/store'
import {DataValue, PendingDataItem} from '../../../interfaces/data'
import {RowMetaField} from '../../../interfaces/rowMeta'
import {$do} from '../../../actions/actions'
import styles from './CheckboxPicker.less'
import {buildBcUrl} from '../../../utils/strings'
import {ChangeDataItemPayload} from '../../Field/Field'

interface CheckboxPickerOwnProps {
    fieldName: string
    fieldLabel: string
    bcName: string,
    cursor: string,
    readonly?: boolean,
    value: DataValue
}

interface CheckboxPickerProps extends CheckboxPickerOwnProps {
    metaField: RowMetaField
    onChange: (payload: ChangeDataItemPayload) => void,
}

const CheckboxPicker = (props: CheckboxPickerProps) => {
    const {metaField} = props

    const handleChange = React.useCallback((event: CheckboxChangeEvent) => {
        const {bcName, cursor, fieldName} = props
        const dataItem: PendingDataItem = {[fieldName]: event.target.checked}
        const payload: ChangeDataItemPayload = {
            bcName,
            cursor,
            dataItem
        }
        props.onChange(payload)
    }, [props.onChange, props.bcName, props.cursor, props.fieldName, props.value])

    return (
        <div className={styles.container}>
            {<Checkbox
                checked={props.value as boolean}
                disabled={metaField && metaField.disabled || props.readonly}
                onChange={handleChange}
            >
                {props.fieldLabel}
            </Checkbox>
            }
        </div>
    )
}

function mapStateToProps(store: Store, ownProps: CheckboxPickerOwnProps) {
    const bcUrl = buildBcUrl(ownProps.bcName, true)
    const metaField = bcUrl
        && store.view.rowMeta[ownProps.bcName]
        && store.view.rowMeta[ownProps.bcName][bcUrl]
        && store.view.rowMeta[ownProps.bcName][bcUrl].fields
        && store.view.rowMeta[ownProps.bcName][bcUrl].fields.find(field => field.key === ownProps.fieldName)
    return {
        metaField
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onChange: (payload: ChangeDataItemPayload) => {
            dispatch($do.changeDataItem(payload))
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckboxPicker)
