import React, { FunctionComponent, ComponentType } from 'react'
import cn from 'classnames'
import { RowMetaField } from '../../interfaces/rowMeta'
import { WidgetListField } from '../../interfaces/widget'
import ColumnFilter, { ColumnFilterOwnProps } from './ColumnFilter'
import ColumnSort from './ColumnSort'
import styles from './ColumnTitle.less'
import TemplatedTitle from '../TemplatedTitle/TemplatedTitle'
import { FieldType } from '../../interfaces/view'
import { FieldTypeEnum } from '@tesler-ui/schema'

/**
 * TODO: Rename to ColumnTitleProps in 2.0.0
 */
export interface ColumnTitle {
    widgetName: string
    widgetMeta: WidgetListField
    rowMeta: RowMetaField
    components?: {
        filter?: ComponentType<ColumnFilterOwnProps>
    }
    className?: string
}

export const notSortableFields: Readonly<Array<FieldType | FieldTypeEnum>> = [
    FieldTypeEnum.multivalue,
    FieldTypeEnum.multivalueHover,
    FieldTypeEnum.multifield,
    FieldTypeEnum.hidden,
    FieldTypeEnum.fileUpload,
    FieldTypeEnum.inlinePickList,
    FieldTypeEnum.hint,
    FieldType.multivalue,
    FieldType.multivalueHover,
    FieldType.multifield,
    FieldType.hidden,
    FieldType.fileUpload,
    FieldType.inlinePickList,
    FieldType.hint
]

/**
 *
 * @param props
 * @category Components
 */
export const ColumnTitle: FunctionComponent<ColumnTitle> = props => {
    if (!props.widgetMeta && !props.rowMeta) {
        return null
    }
    const title = <TemplatedTitle widgetName={props.widgetName} title={props.widgetMeta.title} />
    if (!props.rowMeta) {
        return <div>{title}</div>
    }

    const sort = !notSortableFields.includes(props.widgetMeta.type) && (
        <ColumnSort widgetName={props.widgetName} fieldKey={props.widgetMeta.key} className={styles.sort} />
    )

    const filter =
        props.rowMeta.filterable &&
        (props.components?.filter ? (
            <props.components.filter widgetName={props.widgetName} widgetMeta={props.widgetMeta} rowMeta={props.rowMeta} />
        ) : (
            <ColumnFilter widgetName={props.widgetName} widgetMeta={props.widgetMeta} rowMeta={props.rowMeta} />
        ))
    return (
        <div className={cn(styles.container, props.className)}>
            {title}
            {filter}
            {sort}
        </div>
    )
}

export default ColumnTitle
