import React from 'react'
import {Tag, Icon} from 'antd'
import {MultivalueSingleValue} from '../../../interfaces/data'
import {MultivalueFieldMeta} from '../../../interfaces/widget'
import styles from './MultivalueTag.less'
import cn from 'classnames'

export interface MultivalueTagProps {
    disabled: boolean,
    placeholder?: string,
    value: MultivalueSingleValue[],
    widgetFieldMeta: MultivalueFieldMeta,
    bcName: string,
    loading?: boolean,
    page: number,
    metaError: string,
    onPopupOpen: (bcName: string, widgetFieldMeta: MultivalueFieldMeta, page: number) => void,
    onChange: (newValue: MultivalueSingleValue[], removedValue: MultivalueSingleValue) => void
}

const MultivalueTag: React.FunctionComponent<MultivalueTagProps> = (props) => {
    const loading = props.loading
    const handleOpen = React.useCallback(() => {
        const {disabled, onPopupOpen, bcName, page, widgetFieldMeta} = props
        if (!disabled) {
            onPopupOpen(bcName, widgetFieldMeta, page)
        }
    }, [props.disabled, props.onPopupOpen, props.bcName, props.page, props.widgetFieldMeta])

    const handleDeleteTag = React.useCallback(
        (recordId: string) => {
            const {value, disabled, onChange} = props
            if (!disabled) {
                onChange(value.filter(item => item.id !== recordId), value.find(item => item.id === recordId))
            }
        },
        [props.onChange, props.value, props.disabled]
    )

    return (
        <div
            className={cn(
                styles.multivalue,
                { [styles.disabled]: props.disabled, [styles.error]: props.metaError })
            }
        >
            <div
                data-text={props.placeholder}
                className={cn(
                    styles.enabled,
                    { [styles.disabled]: props.disabled })}>
                { (props.value || []).map(val => {
                    return <Tag
                        title={val.value}
                        closable={!props.disabled}
                        id={val.id}
                        key={val.id}
                        onClose={() => {
                            handleDeleteTag(val.id)
                        }}
                    >
                        {val.value}
                    </Tag>
                })}
            </div>
            <div className={cn(styles.iconContainer, {[styles.disabled]: props.disabled})}
                 onClick={loading ? undefined : handleOpen}>
                <Icon
                    type={loading ? 'loading' : 'folder-open'}
                    spin={loading}
                />
            </div>
        </div>
    )
}

export default React.memo(MultivalueTag)

