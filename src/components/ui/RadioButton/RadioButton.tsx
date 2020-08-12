import React from 'react'
import {Radio} from 'antd'
import ReadOnlyField from '../ReadOnlyField/ReadOnlyField'
import {RadioChangeEvent} from 'antd/es/radio'
import {getIconByParams} from '../Dictionary/Dictionary'

export interface RadioButtonProps {
    value?: string | null,
    onChange?: (value: string) => void,
    values: Array<{ value: string, icon?: string }>,
    readOnly?: boolean,
    disabled?: boolean,
    style?: React.CSSProperties,
    className?: string,
    backgroundColor?: string,
    onDrillDown?: () => void
}

const RadioButton: React.FunctionComponent<RadioButtonProps> = (props) => {
    if (props.readOnly) {
        const readOnlyValue = props.value ?? ''

        return <ReadOnlyField
            className={props.className}
            backgroundColor={props.backgroundColor}
            onDrillDown={props.onDrillDown}
        >
            {readOnlyValue}
        </ReadOnlyField>
    }

    const handleOnChange = React.useCallback(
        (e: RadioChangeEvent) => {
            let value: string
            const values = props.values

            if (values) {
                const valueId = Number(e.target.value)
                value = values[valueId]?.value
                props.onChange?.(value || '')
            }
        },
        [props.values, props.onChange]
    )

    let valueIndex: number

    if (props.value && props.values) {
        valueIndex = props.values.findIndex((v) => v.value === props.value)
    }

    return (
        <Radio.Group onChange={handleOnChange}
                     disabled={props.disabled}
                     value={valueIndex >= 0 ? valueIndex.toString() : props.value}
                     className={props.className}
        >
            {props.values?.map((el, index) =>
                <Radio value={index.toString()}
                       key={index}
                >
                    <span>
                        {el.icon && getIconByParams(el.icon)}
                        <span>{el.value}</span>
                    </span>
                </Radio>
            )}
        </Radio.Group>
    )
}
export default React.memo(RadioButton)
