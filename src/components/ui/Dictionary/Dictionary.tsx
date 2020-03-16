import React from 'react'
import {Icon, Select as AntdSelect} from 'antd'
import Select from '../Select/Select'
import ReadOnlyField from '../ReadOnlyField/ReadOnlyField'

interface IDictionaryProps {
    value?: string | null,
    onChange?: (value: string) => void
    values: Array<{value: string, icon: string}>,
    readOnly?: boolean,
    disabled?: boolean,
    fieldName: string,
    style?: React.CSSProperties,
    metaIcon?: JSX.Element,
    valueIcon?: string,
    popupContainer?: HTMLElement,
    className?: string,
    backgroundColor?: string,
    onDrillDown?: () => void,
}

const Dictionary: React.FunctionComponent<IDictionaryProps> = (props) => {
    if (props.readOnly) {
        const readOnlyValue = (props.value !== null && props.value !== undefined) ? props.value : ''

        return <ReadOnlyField
            className={props.className}
            backgroundColor={props.backgroundColor}
            onDrillDown={props.onDrillDown}
        >
            {readOnlyValue}
        </ReadOnlyField>
    }

    const selectRef = React.useRef<AntdSelect<string>>(null)

    const handleFilter = React.useCallback(
        (input: string, option: JSX.Element) => {
            return String(option.props.title).toLowerCase().includes(input.toLowerCase())
        },
        []
    )

    const handleOnChange = React.useCallback(
        (valueKey: string) => {
            let value: string
            const values = props.values

            if (values) {
                const valueId = Number(valueKey)
                value = values[valueId]?.value
            }

            props.onChange(value || '')
        },
        [props.values, props.onChange]
    )

    let valueIndex: number

    if (props.value && props.values) {
        valueIndex = props.values.findIndex((v) => v.value === props.value)
    }

    return (
        <Select
            {...props}
            disabled={props.disabled}
            value={valueIndex >= 0 ? valueIndex.toString() : props.value }
            allowClear={!!props.value}
            showSearch
            onChange={handleOnChange}
            dropdownMatchSelectWidth={false}
            filterOption={handleFilter}
            getPopupContainer={trigger => trigger.parentElement}
            forwardedRef={selectRef}
            className={props.className}
        >
            {props.values?.length
                ? props.values.map((el, index) => {
                    // @see https://github.com/ant-design/ant-design/issues/7138#issuecomment-324116471
                    const titleFix = { title: el.value }
                    return (
                        <Select.Option
                            {...titleFix}
                            key={index.toString()}
                            value={index.toString()}
                        >
                            <span>
                                {props.metaIcon}
                                {el.icon && getIconByParams(el.icon)}
                                <span>{el.value}</span>
                            </span>
                        </Select.Option>
                    )
                })
                : <Select.Option
                    {...{ title: props.value }}
                    key={props.value || ''}
                    value={props.value}
                >
                    {props.metaIcon}
                    {props.valueIcon && getIconByParams(props.valueIcon)}
                    <span>{props.value}</span>
                </Select.Option>
            }
        </Select>
    )
}

/**
 * TODO
 *
 * @param params
 * @param extraStyleClasses
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
