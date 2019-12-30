import React, {FunctionComponent} from 'react'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import {Input, Tooltip, Form} from 'antd'
import {$do} from '../../actions/actions'
import {Store} from '../../interfaces/store'
import {DataItem, DataValue, MultivalueSingleValue, PendingDataItem} from '../../interfaces/data'
import {FieldType} from '../../interfaces/view'
import {RowMetaField} from '../../interfaces/rowMeta'
import {WidgetField, WidgetTypes} from '../../interfaces/widget'
import DatePickerField from '../ui/DatePickerField/DatePickerField'
import NumberInput from '../../components/ui/NumberInput/NumberInput'
import {NumberTypes} from '../../components/ui/NumberInput/formaters'
import TextArea from '../../components/ui/TextArea/TextArea'
import Dictionary from '../../components/ui/Dictionary/Dictionary'
import {buildBcUrl} from '../../utils/strings'
import MultivalueField from '../Multivalue/MultivalueField'
import MultiField from '../ui/MultiField/MultiField'
import ReadOnlyField from '../ui/ReadOnlyField/ReadOnlyField'
import PickListField from '../PickListField/PickListField'
import InlinePickList from '../InlinePickList/InlinePickList'
import FileUpload from '../FileUpload/FileUpload'
import MultivalueHover from '../ui/Multivalue/MultivalueHover'
import cn from 'classnames'
import readOnlyFieldStyles from '../../components/ui/ReadOnlyField/ReadOnlyField.less'
import CheckboxPicker from '../../components/ui/CheckboxPicker/CheckboxPicker'
import styles from './Field.less'
import {CustomizationContext} from '../../components/View/View'

interface FieldOwnProps {
    widgetFieldMeta: WidgetField,
    widgetName: string,
    bcName: string,
    cursor: string,
    data?: DataItem,
    className?: string,
    readonly?: boolean,
    disableDrillDown?: boolean,
    forceFocus?: boolean
}

interface FieldProps extends FieldOwnProps {
    data: DataItem,
    pendingValue: DataValue,
    rowFieldMeta: RowMetaField,
    metaError: string,
    showErrorPopup: boolean,
    onChange: (payload: ChangeDataItemPayload) => void,
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void,
}

export interface ChangeDataItemPayload { // TODO: Может из карты в actions/actions подтащить?
    bcName: string,
    cursor: string,
    dataItem: PendingDataItem
}

export const emptyMultivalue: MultivalueSingleValue[] = []

export const Field: FunctionComponent<FieldProps> = (props) => {
    const [localValue, setLocalValue] = React.useState(null)
    let resultField: React.ReactChild = null
    // todo: временный фикс для корректной работы с пиклистами
    const undefinedValuesAllowed = [
        FieldType.pickList,
        FieldType.inlinePickList,
        FieldType.fileUpload,
        FieldType.date,
        FieldType.dateTime,
        FieldType.dateTimeWithSeconds,
        FieldType.checkbox
    ]
    const value = undefinedValuesAllowed.includes(props.widgetFieldMeta.type)
        ? (props.pendingValue !== undefined)
            ? props.pendingValue
            : props.data && props.data[props.widgetFieldMeta.key]
        : props.pendingValue || props.data && props.data[props.widgetFieldMeta.key]

    const disabled = (props.rowFieldMeta ? props.rowFieldMeta.disabled : true)

    const handleChange = React.useCallback(eventValue => {
        const dataItem = { [props.widgetFieldMeta.key]: eventValue }
        setLocalValue(null)
        props.onChange({ bcName: props.bcName, cursor: props.cursor, dataItem })
    }, [props.bcName, props.cursor, props.widgetFieldMeta.key])

    const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(event.target.value)
    }, [])

    const bgColor = props.widgetFieldMeta.bgColorKey
        ? props.data && (props.data[props.widgetFieldMeta.bgColorKey] as string)
        : props.widgetFieldMeta.bgColor

    const handleDrilldown = React.useMemo(
        () => {
            return (!props.disableDrillDown && props.widgetFieldMeta.drillDown)
                ? () => {
                    props.onDrillDown(props.widgetName, props.data && props.data.id, props.bcName, props.widgetFieldMeta.key)
                }
                : null
        },
        [props.disableDrillDown, props.widgetFieldMeta.drillDown, props.widgetName, props.data && props.data.id, props.bcName,
            props.widgetFieldMeta.key]
    )

    const handleInputBlur = React.useCallback(() => {
        if (localValue != null) {
            handleChange(localValue)
        }
    }, [localValue, handleChange])

    const commonProps = {
        cursor: props.cursor,
        widgetName: props.widgetName,
        meta: props.widgetFieldMeta,
        className: cn(props.className),
        metaError: props.metaError,
        disabled,
        readOnly: props.readonly,
        backgroundColor: bgColor
    }

    switch (props.widgetFieldMeta.type) {
        case FieldType.date:
        case FieldType.dateTime:
        case FieldType.dateTimeWithSeconds:
            resultField = <DatePickerField
                {...commonProps}
                onChange={handleChange}
                value={(value || '').toString()}
                showTime={props.widgetFieldMeta.type === FieldType.dateTime}
                showSeconds={props.widgetFieldMeta.type === FieldType.dateTimeWithSeconds}
                onDrillDown={handleDrilldown}
            />
            break
        case FieldType.number:
            resultField = <NumberInput
                {...commonProps}
                value={value as number}
                type={NumberTypes.number}
                digits={props.widgetFieldMeta.digits}
                nullable={props.widgetFieldMeta.nullable}
                onChange={handleChange}
                onDrillDown={handleDrilldown}
                forceFocus={props.forceFocus}
            />
            break
        case FieldType.money:
            resultField = <NumberInput
                {...commonProps}
                value={value as number}
                type={NumberTypes.money}
                digits={props.widgetFieldMeta.digits}
                nullable={props.widgetFieldMeta.nullable}
                onChange={handleChange}
                onDrillDown={handleDrilldown}
                forceFocus={props.forceFocus}
            />
            break
        case FieldType.percent:
            resultField = <NumberInput
                {...commonProps}
                value={value as number}
                type={NumberTypes.percent}
                digits={props.widgetFieldMeta.digits}
                nullable={props.widgetFieldMeta.nullable}
                onChange={handleChange}
                onDrillDown={handleDrilldown}
                forceFocus={props.forceFocus}
            />
            break
        case FieldType.dictionary:
            resultField = <Dictionary
                {...commonProps}
                value={value as any}
                values={props.rowFieldMeta ? props.rowFieldMeta.values : []}
                fieldName={props.widgetFieldMeta.key}
                onChange={handleChange}
                onDrillDown={handleDrilldown}
            />
            break
        case FieldType.text:
            resultField = <TextArea
                {...commonProps}
                defaultValue={value as any}
                onChange={handleChange}
                onDrillDown={handleDrilldown}
                forceFocus={props.forceFocus}
            />
            break
        case FieldType.multifield:
            resultField = <MultiField
                {...commonProps}
                fields={props.widgetFieldMeta.fields}
                data={props.data}
                bcName={props.bcName}
                cursor={props.cursor}
                widgetName={props.widgetName}
                style={props.widgetFieldMeta.style}
            />
            break
        case FieldType.multivalue:
            resultField = <MultivalueField
                {...commonProps}
                widgetName={props.widgetName}
                defaultValue={
                    Array.isArray(value) && value.length > 0 ?
                        value : emptyMultivalue
                }
                widgetFieldMeta={props.widgetFieldMeta}
                bcName={props.bcName}
            />
            break
        case FieldType.pickList:
            resultField = <PickListField
                {...commonProps}
                parentBCName={props.bcName}
                bcName={props.widgetFieldMeta.popupBcName}
                cursor={props.cursor}
                value={value as any}
                pickMap={props.widgetFieldMeta.pickMap}
                onDrillDown={handleDrilldown}
            />
            break
        case FieldType.inlinePickList:
            resultField = <InlinePickList
                {...commonProps}
                fieldName={props.widgetFieldMeta.key}
                searchSpec={props.widgetFieldMeta.searchSpec}
                bcName={props.bcName}
                popupBcName={props.widgetFieldMeta.popupBcName}
                cursor={props.cursor}
                value={value as string}
                pickMap={props.widgetFieldMeta.pickMap}
                onDrillDown={handleDrilldown}
            />
            break
        case FieldType.checkbox:
            resultField = <CheckboxPicker
                {...commonProps}
                fieldName={props.widgetFieldMeta.key}
                fieldLabel={props.widgetFieldMeta.label}
                value={value}
                bcName={props.bcName}
                cursor={props.cursor}
                readonly={props.readonly}
            />
            break
        case FieldType.fileUpload:
            resultField = <FileUpload
                {...commonProps}
                fieldName={props.widgetFieldMeta.key}
                bcName={props.bcName}
                cursor={props.cursor}
                fieldDataItem={props.data}
                fieldValue={value as string}
                fileIdKey={props.widgetFieldMeta.fileIdKey}
                fileSource={props.widgetFieldMeta.fileSource}
            />
            break
        case FieldType.multivalueHover:
            resultField = <MultivalueHover
                {...commonProps}
                data={(value || emptyMultivalue) as MultivalueSingleValue[]}
                displayedValue={props.widgetFieldMeta.displayedKey && props.data[props.widgetFieldMeta.displayedKey]}
                onDrillDown={handleDrilldown}
            />
            break
        case FieldType.hint:
            resultField = <ReadOnlyField
                {...commonProps}
                className={cn(
                    props.className,
                    readOnlyFieldStyles.hint
                )}
                onDrillDown={handleDrilldown}
            >
                {value}
            </ReadOnlyField>
            break
        default:
            resultField = <CustomizationContext.Consumer>
                {context => {
                    const customFields = context.customFields
                    if (customFields && (customFields[props.widgetFieldMeta.type] || customFields[props.widgetFieldMeta.key])) {
                        const CustomComponent = customFields[props.widgetFieldMeta.type] || customFields[props.widgetFieldMeta.key]
                        return <CustomComponent
                            {...commonProps}
                            value={value}
                            onBlur={handleInputBlur}
                        />
                    }

                    return props.readonly
                        ? <ReadOnlyField
                            {...commonProps}
                            onDrillDown={handleDrilldown}
                        >
                            {value}
                        </ReadOnlyField>
                        : <Input
                            {...commonProps}
                            value={localValue !== null ? localValue : (value ? String(value) : '')}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            autoFocus={props.forceFocus}
                        />

                }}
            </CustomizationContext.Consumer>
    }
    if (props.metaError && !props.readonly && props.showErrorPopup) {
        return <Tooltip
                overlayClassName={styles.error}
                title={props.metaError}
                getPopupContainer={(trigger) => trigger.parentElement}
        >
            <div>
                <Form.Item validateStatus="error">
                    {resultField}
                </Form.Item>
            </div>
        </Tooltip>
    }
    return resultField
}

function mapStateToProps(store: Store, ownProps: FieldOwnProps) {
    const bcUrl = buildBcUrl(ownProps.bcName, true)
    const rowMeta = bcUrl
        && store.view.rowMeta[ownProps.bcName]
        && store.view.rowMeta[ownProps.bcName][bcUrl]
        && store.view.rowMeta[ownProps.bcName][bcUrl]
    const rowFieldMeta = rowMeta && rowMeta.fields.find(field => field.key === ownProps.widgetFieldMeta.key)
    const missing = store.view.pendingValidationFails && store.view.pendingValidationFails[ownProps.widgetFieldMeta.key]
    const metaError = missing || rowMeta && rowMeta.errors && rowMeta.errors[ownProps.widgetFieldMeta.key]
    const pendingValue = store.view.pendingDataChanges[ownProps.bcName]
        && store.view.pendingDataChanges[ownProps.bcName][ownProps.cursor]
        && store.view.pendingDataChanges[ownProps.bcName][ownProps.cursor][ownProps.widgetFieldMeta.key]
    const widget = store.view.widgets.find(item => item.name === ownProps.widgetName)
    const showErrorPopup = widget && widget.type !== WidgetTypes.Form
    return {
        data: (ownProps.data)
            ? ownProps.data
            : store.data[ownProps.bcName] && store.data[ownProps.bcName].find(item => item.id === ownProps.cursor),
        pendingValue,
        rowFieldMeta,
        metaError,
        showErrorPopup
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onChange: (payload: ChangeDataItemPayload) => {
            return dispatch($do.changeDataItem(payload))
        },
        onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => {
            dispatch($do.userDrillDown({ widgetName, cursor, bcName, fieldKey }))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Field)
