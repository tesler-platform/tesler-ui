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
import HiddenString from '../HiddenString/HiddenString'

type AdditionalAntdTextAreaProps = Partial<Omit<AntdTextAreaProps, 'onChange'>>
export interface TextAreaProps extends AdditionalAntdTextAreaProps {
    defaultValue?: string | null,
    maxInput?: number,
    showLength?: number,
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

export const TextArea: React.FunctionComponent<TextAreaProps> = (props) => {
    if (props.readOnly) {
        return <ReadOnlyField
            className={props.className}
            backgroundColor={props.backgroundColor}
            onDrillDown={props.onDrillDown}
        >
            {props.showLength
                ? <HiddenString inputString={props.defaultValue} showLength={props.showLength}/>
                :props.defaultValue}
        </ReadOnlyField>
    }

    const {
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
                // Access to private-field, for fixing IE11 bug:
                // While first opening cursor should take place at the end of text, but it appears at the start
                // TODO: find out bug solution without refusing of animation
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
                        maxLength={maxInput}
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
            maxLength={maxInput}
            {...rest}
        />
    }
}

export default React.memo(TextArea)
