import React from 'react'
import {Icon, Select as AntdSelect} from 'antd'
import Select, {SelectProps} from '../Select/Select'
import ReadOnlyField from '../ReadOnlyField/ReadOnlyField'
import {MultivalueSingleValue} from '../../../interfaces/data'
import SearchHighlight from '../SearchHightlight/SearchHightlight'
import {escapedSrc} from '../../../utils/strings'

export interface DictionaryProps {
    value?: MultivalueSingleValue[] | string | null,
    onChange?: (value: MultivalueSingleValue[] | string) => void,
    values: Array<{value: string, icon?: string}>,
    readOnly?: boolean,
    disabled?: boolean,
    fieldName: string,
    placeholder?: string,
    style?: React.CSSProperties,
    metaIcon?: JSX.Element,
    valueIcon?: string,
    popupContainer?: HTMLElement,
    className?: string,
    backgroundColor?: string,
    onDrillDown?: () => void,
    multiple?: boolean,
    filterValue?: string
}

const Dictionary: React.FunctionComponent<DictionaryProps> = (props) => {
    if (props.readOnly) {
        let readOnlyValue = props.value ?? ''
        if (props.multiple) {
            readOnlyValue = (readOnlyValue as MultivalueSingleValue[]).map(i => i.value).join((', '))
        }
        return <ReadOnlyField
            className={props.className}
            backgroundColor={props.backgroundColor}
            onDrillDown={props.onDrillDown}
        >
            {props.filterValue
                ? <SearchHighlight
                    source={(readOnlyValue || '').toString()}
                    search={escapedSrc(props.filterValue)}
                    match={formatString => <b>{formatString}</b>}/>
                : readOnlyValue}
        </ReadOnlyField>
    }

    const selectRef = React.useRef<AntdSelect<string>>(null)

    const handleOnChange = React.useCallback(
        (v: string | string[]) => {
            if (props.multiple) {
                props.onChange((v as string[]).map(item => ({ id: item, value: item })))
            } else {
                props.onChange(v as string || '')
            }
        },
        [props.multiple, props.values, props.onChange]
    )

    const resultValue = React.useMemo(() => {
        if (props.multiple) {
            return (props.value as MultivalueSingleValue[])?.map(i => i.value) ?? []
        } else {
            return props.value ?? undefined
        }
    }, [props.value, props.multiple, props.values])

    const extendedProps: SelectProps = {
        ...props,
        mode: props.multiple ? 'multiple' : 'default',
        value: resultValue as string | string[],
        allowClear: !!props.value,
        showSearch: true,
        onChange: handleOnChange,
        dropdownMatchSelectWidth: false,
        getPopupContainer: trigger => trigger.parentElement,
        forwardedRef: selectRef
    }

    const options = React.useMemo(
        () => {
            const noValues = !props.values?.length
            const hasMultipleValue = noValues && props.multiple && props.value?.length
            const hasSingleValue = noValues && !props.multiple && props.value
            if (hasMultipleValue) {
                return (props.value as MultivalueSingleValue[])?.map((item) => {
                    return <Select.Option key={item.value} title={item.value}>
                        {item.options?.icon && getIconByParams(item.options.icon)}
                        <span>{item.value}</span>
                    </Select.Option>
                })
            }
            if (hasSingleValue) {
                return <Select.Option key={props.value as string} title={props.value as string}>
                    {props.metaIcon}
                    {props.valueIcon && getIconByParams(props.valueIcon)}
                    <span>{props.value}</span>
                </Select.Option>
            }
            return props.values?.map((item) => {
                return <Select.Option key={item.value} title={item.value}>
                    {item.icon && getIconByParams(item.icon)}
                    <span>{item.value}</span>
                </Select.Option>
            })

        },
        [props.value, props.values, props.multiple, props.metaIcon, props.valueIcon]
    )

    return <Select {...extendedProps}>{options}</Select>
}

/**
 * Returns Icon component
 *
 * @param params Contains `type` and `color`
 * @param extraStyleClasses extra css classes
 */
export function getIconByParams(params: string, extraStyleClasses?: string) {
    if (params) {
        const [antIconType, cssColor] = params.split(' ')
        return <Icon
            type={antIconType}
            style={{color: cssColor}}
            className={extraStyleClasses}
        />
    }
    return null
}

export default React.memo(Dictionary)
