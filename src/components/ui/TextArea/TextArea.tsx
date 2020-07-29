import React from 'react'
import {
    Input,
    Popover,
    Button
} from 'antd'
import InputDefaultClass from 'antd/lib/input/TextArea'
import styles from './TextArea.less'
import ReadOnlyField from '../ReadOnlyField/ReadOnlyField'
import {TextAreaProps as AntdTextAreaProps} from 'antd/lib/input/TextArea'
import {WidgetField} from 'interfaces/widget'

type AdditionalAntdTextAreaProps = Partial<Omit<AntdTextAreaProps, 'onChange'>>
export interface TextAreaProps extends AdditionalAntdTextAreaProps {
    cursor?:string,
    widgetName?: string,
    metaError?: string,
    meta?: WidgetField, // TODO 2.0.0 must be required?
    defaultValue?: string | null,
    maxInput?: number, // TODO 2.0.0 remove in favour `maxInput` from @param `meta`
    onChange?: (value: string) => void,
    popover?: boolean,
    disabled?: boolean,
    readOnly?: boolean,
    style?: React.CSSProperties,
    minRows?: number,
    maxRows?: number,
    className?: string,
    backgroundColor?: string,
    onDrillDown?: () => void
}

const TextArea: React.FunctionComponent<TextAreaProps> = (props) => {
    if (props.readOnly) {
        return <ReadOnlyField
            className={props.className}
            backgroundColor={props.backgroundColor}
            onDrillDown={props.onDrillDown}
        >
            {props.defaultValue}
        </ReadOnlyField>
    }

    const {
        cursor,
        widgetName,
        metaError,
        meta,
        defaultValue,
        maxInput,
        onChange,
        popover,
        disabled,
        readOnly,
        style,
        minRows,
        maxRows,
        className,
        backgroundColor,
        onDrillDown,
        ...rest} = props
    const inputRef = React.useRef<Input>(null)
    const textAreaRef = React.useRef<InputDefaultClass>(null)

    const [popoverVisible, setPopoverVisible] = React.useState<boolean>(false)

    const popoverTextAreaBlurHandler = React.useCallback(
        (event: React.FormEvent<HTMLTextAreaElement>) => {
            props.onChange(event.currentTarget.value)
        },
        [props.onChange]
    )

    const popoverHideHandler = React.useCallback(
        () => {
            setPopoverVisible(false)
        },
        []
    )

    const popoverVisibleChangeHandler = React.useCallback(
        (value: boolean) => {
            setPopoverVisible(value)
        },
        []
    )

    const onTextAreaShowed = React.useCallback(
        () => {
            if (textAreaRef.current) {
                textAreaRef.current.focus()
                // Доступ к private-полю, чтобы исправить баг в IE11 когда фокус при первом открытии выставляется в начало, а не в конец
                // TODO: разобраться откуда баг и как его убрать без отказа от анимации
                if (props.defaultValue) {
                    const textArea = (textAreaRef.current as any).textAreaRef as HTMLTextAreaElement
                    textArea.setSelectionRange(props.defaultValue.length, props.defaultValue.length)
                }
            }
        },
        []
    )

    React.useEffect(
        () => {
            textAreaRef.current.setValue(defaultValue ?? '')
        },
        [defaultValue]
    )
    const autosize = React.useMemo(() => { return {minRows: props.minRows || 5, maxRows: props.maxRows || 10 }},
        [props.minRows, props.maxRows])

    const computedMaxLength = props.maxInput || props.meta?.maxInput // TODO 2.0.0 remove `props.maxInput` in favour `props.meta?.maxInput`

    if (popover) {
        const rcTooltipProps = { afterVisibleChange: onTextAreaShowed }
        return <Popover
            {...rcTooltipProps}
            placement="right"
            title={''}
            overlayClassName={styles.popoverCard}
            content={
                <div className={styles.popoverCardInnerWrapper}>
                    <Input.TextArea
                        ref={textAreaRef}
                        defaultValue={defaultValue}
                        rows={4}
                        onBlur={popoverTextAreaBlurHandler}
                        disabled={disabled}
                        maxLength={computedMaxLength}
                        {...rest}
                    />
                    <Button
                        className={styles.popoverOkBtn}
                        icon="check"
                        onClick={popoverHideHandler}
                    />
                </div>
            }
            trigger="click"
            visible={popoverVisible}
            onVisibleChange={popoverVisibleChangeHandler}
        >
            <Input
                readOnly={true}
                value={defaultValue}
                style={props.style}
                className={styles.pointer}
                ref={inputRef}
            />
        </Popover>
    } else {
        return <Input.TextArea
            ref={textAreaRef}
            defaultValue={defaultValue}
            autoSize={autosize}
            disabled={disabled}
            onBlur={popoverTextAreaBlurHandler}
            style={props.style}
            className={props.className}
            maxLength={computedMaxLength}
            {...rest}
        />
    }
}

export default React.memo(TextArea)
