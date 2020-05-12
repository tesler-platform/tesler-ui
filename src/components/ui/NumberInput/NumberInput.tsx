import React, {RefAttributes} from 'react'
import {
    Input
} from 'antd'
import {NumberTypes, fractionsRound, NumberInputFormat} from '../../../components/ui/NumberInput/formaters'
import ReadOnlyField from '../ReadOnlyField/ReadOnlyField'
import {InputProps} from 'antd/es/input'

export interface NumberInputProps {
    readOnly?: boolean,
    disabled?: boolean,
    backgroundColor?: string,
    onChange?: (value: number) => void,
    value: number,
    nullable?: boolean,
    digits?: number,
    type: NumberTypes,
    maxInput?: number,
    className?: string,
    onDrillDown?: () => void,
    forceFocus?: boolean,
}

const NumberInput: React.FunctionComponent<NumberInputProps> = (props) => {
    if (props.readOnly) {
        return <ReadOnlyField
            className={props.className}
            backgroundColor={props.backgroundColor}
            onDrillDown={props.onDrillDown}
        >
            {NumberInputFormat.number(props.value, props.digits, props.nullable)}
        </ReadOnlyField>
    }

    const inputRef = React.useRef<Input>(null)

    const getDisplayedValueText = (value?: number): string => {
        return NumberInputFormat[props.type](
            value !== undefined ? value : props.value,
            props.digits,
            props.nullable
        )
    }

    const [mode, setMode] = React.useState<'edit' | 'view'>('view')
    const [valueText, setValueText] = React.useState<string>(getDisplayedValueText())

    React.useEffect(
        () => {
            if (mode === 'view') {
                setValueText(getDisplayedValueText())
            }
        },
        [mode, props.value]
    )

    /**
     * TODO
     *
     * @param text 
     */
    function parseEditedValueText(text: string): number | null {
        if (props.nullable && text === '') {
            return null
        }
        const value = normalizeValueFormat(text)
        return fractionsRound(Number(value), props.digits)
    }

    const handleOnBlur = React.useCallback(
        (event: React.FormEvent<HTMLInputElement>) => {
            const value = parseEditedValueText(event.currentTarget.value)

            if (isNaN(value)) {
                // TODO: лучше бы ошибку показать а не сбрасывать
                setMode('view')
                setValueText(getDisplayedValueText())
                return
            }

            if (props.onChange) {
                setMode('view')
                setValueText(getDisplayedValueText(value))
                props.onChange(value)
            }
        },
        [props.onChange]
    )

    const handleOnFocus = React.useCallback(
        () => {
            // Fix cusror resetting to start position on Internet Explorer
            // selectionStart and selectionEnd are always 0 in Chrome during onFocus
            setTimeout(() => {
                if (inputRef.current?.input) {
                    const target = inputRef.current.input
                    const value = target.value
                    const selectionStart = target.selectionStart
                    const selectionEnd = target.selectionEnd

                    const unformatedValue = unformatValue(value)
                    setMode('edit')

                    target.value = unformatedValue
                    const selection = getUnformatedValueSelection(value, selectionStart, selectionEnd)
                    target.setSelectionRange(
                        selection[0], selection[1]
                    )
                }
            }, 0)
        },
        []
    )

    const handleOnChange = React.useCallback(
        (event: React.FormEvent<HTMLInputElement>) => {
            const value = (props.maxInput && event.currentTarget.value.length > props.maxInput)
                ? event.currentTarget.value.slice(0, props.maxInput)
                : event.currentTarget.value

            setValueText(value)
        },
        [props.maxInput]
    )

    // Отфильтровывает нажатия на недопустимые символы
    // !! недопустимые символы всеравно могут попасть в поле ввода через вставку из буфера обмена
    const onKeyPress = React.useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            const char = String.fromCharCode(event.keyCode || event.charCode)
            if (unformatValue(char) === ''
                || (props.maxInput && valueText?.length >= props.maxInput)
            ) {
                event.preventDefault()
            }
        },
        [props.maxInput, valueText]
    )

    const extendedProps: InputProps & RefAttributes<any> = {
        ...props,
        style: {
            backgroundColor: props.backgroundColor || '#fff'
        },
        onChange: handleOnChange,
        onBlur: handleOnBlur,
        onFocus: handleOnFocus,
        value: valueText,
        type: 'text',
        ref: inputRef,
        onKeyPress: onKeyPress,
        autoFocus: props.forceFocus
    }

    return <Input {...extendedProps} />
}

/**
 * TODO
 *
 * @param text 
 */
function normalizeValueFormat(text: string) {
    return text
    .replace(/[,.]/g, '.')
    .replace(/[\s]/g, '')
}

/**
 * TODO
 *
 * @param text
 */
function unformatValue(text: string) {
    return text.replace(/[^-,.\d]/g, '')
}

/**
 * TODO
 *
 * @param formatedValue 
 * @param start 
 * @param end 
 */
function getUnformatedValueSelection(formatedValue: string, start: number, end: number): [number, number] {
    const selectionStartStart = formatedValue.substr(0, start)
    const selectionEndStart = formatedValue.substr(0, end)

    return [
        unformatValue(selectionStartStart).length,
        unformatValue(selectionEndStart).length
    ]
}

export default React.memo(NumberInput)
