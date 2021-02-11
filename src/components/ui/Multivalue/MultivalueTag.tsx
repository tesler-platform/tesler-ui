import React from 'react'
import { Tag, Icon } from 'antd'
import { MultivalueSingleValue } from '../../../interfaces/data'
import { MultivalueFieldMeta } from '../../../interfaces/widget'
import styles from './MultivalueTag.less'
import cn from 'classnames'

export interface MultivalueTagProps {
    disabled: boolean
    placeholder?: string
    value: MultivalueSingleValue[]
    widgetFieldMeta: MultivalueFieldMeta
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of `widgetName`
     */
    bcName: string
    widgetName?: string
    loading?: boolean
    page: number
    metaError: string
    onPopupOpen: (bcName: string, widgetFieldMeta: MultivalueFieldMeta, page: number, widgetName?: string) => void
    onChange: (newValue: MultivalueSingleValue[], removedValue: MultivalueSingleValue) => void
}

/**
 *
 * @param props
 * @category Components
 */
const MultivalueTag: React.FunctionComponent<MultivalueTagProps> = props => {
    const loading = props.loading
    const handleOpen = React.useCallback(() => {
        const { disabled, onPopupOpen, bcName, widgetName, page, widgetFieldMeta } = props
        if (!disabled) {
            onPopupOpen(bcName, widgetFieldMeta, page, widgetName)
        }
    }, [props.disabled, props.onPopupOpen, props.bcName, props.page, props.widgetFieldMeta, props.widgetName])

    const handleDeleteTag = React.useCallback(
        (recordId: string) => {
            const { value, disabled, onChange } = props
            if (!disabled) {
                onChange(
                    value.filter(item => item.id !== recordId),
                    value.find(item => item.id === recordId)
                )
            }
        },
        [props.onChange, props.value, props.disabled]
    )

    return (
        <div
            className={cn(styles.multivalue, { [styles.disabled]: props.disabled, [styles.error]: props.metaError })}
            onClick={loading && props.disabled ? undefined : handleOpen}
        >
            <div data-text={props.placeholder} className={cn(styles.enabled, { [styles.disabled]: props.disabled })}>
                {(props.value || []).map(val => {
                    return (
                        <Tag
                            onClick={e => {
                                e.stopPropagation()
                            }}
                            title={val.value}
                            closable={!props.disabled && !loading}
                            id={val.id}
                            key={val.id}
                            onClose={() => {
                                handleDeleteTag(val.id)
                            }}
                        >
                            {val.value}
                        </Tag>
                    )
                })}
            </div>
            <div className={cn(styles.iconContainer, { [styles.disabled]: props.disabled })}>
                <Icon type={loading ? 'loading' : 'folder-open'} spin={loading} />
            </div>
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedMultivalueTag = React.memo(MultivalueTag)

export default MemoizedMultivalueTag
