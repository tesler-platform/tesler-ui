import React from 'react'
import {Input, Icon} from 'antd'
import {useTranslation} from 'react-i18next'
import styles from './PickInput.less'

export interface PickInputProps {
    disabled?: boolean,
    value?: string,
    onClick?: () => void,
    onClear?: () => void,
    className?: string,
    placeholder?:  string
    loading?: boolean,
}

const PickInput: React.FunctionComponent<PickInputProps> = (props) => {

    const handleClick = React.useCallback(
        () => {
            if (!props.disabled && props.onClick) {
                props.onClick()
            }
        },
        [props.disabled, props.onClick]
    )

    const {t} = useTranslation()

    const clearButton = props.onClear && !props.disabled && props.value
        ? <Icon
            type="close-circle"
            onClick={props.onClear}
        />
        : null

    return (
        <Input
            disabled={props.disabled}
            readOnly
            placeholder={props.placeholder ?? t('Select value')}
            value={props.value || ''}
            suffix={clearButton}
            className={props.className}
            addonAfter={props.loading
                ? <Icon type="loading" spin/>
                : <Icon
                    className={props.disabled ? styles.disabledButton : null}
                    type="paper-clip"
                    onClick={!props.disabled ? handleClick : null}
                />
            }
        />
    )
}

export default React.memo(PickInput)

