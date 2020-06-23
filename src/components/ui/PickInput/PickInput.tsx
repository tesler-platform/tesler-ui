import React from 'react'
import {Input, Icon} from 'antd'
import {useTranslation} from 'react-i18next'
import styles from './PickInput.less'
import {Store} from '../../../interfaces/store'
import {buildBcUrl} from '../../..'
import {connect} from 'react-redux'

export interface PickInputOwnProps {
    disabled?: boolean,
    value?: string,
    onClick?: () => void,
    onClear?: () => void,
    className?: string,
    placeholder?:  string
    popupBcName?: string, // TODO: not optional in 2.0
}

export interface PickInputProps extends PickInputOwnProps{
    popupRowMetaDone: boolean
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
            addonAfter={props.popupRowMetaDone || !props.popupBcName
                ? <Icon
                    className={props.disabled ? styles.disabledButton : null}
                    type="paper-clip"
                    onClick={!props.disabled ? handleClick : null}
                />
                : <Icon type="loading" spin/>
            }
        />
    )
}

function mapStateToProps(store: Store,ownProps: PickInputOwnProps) {
    const popupBcName = ownProps?.popupBcName
    const bcUrl = buildBcUrl(popupBcName, true)
    const rowMeta = store.view.rowMeta[popupBcName]?.[bcUrl]?.fields

    return {
        popupRowMetaDone: !!rowMeta,
    }
}

export default connect(mapStateToProps)(PickInput)

