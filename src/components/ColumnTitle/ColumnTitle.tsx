import React, {FunctionComponent} from 'react'
import cn from 'classnames'
import {RowMetaField} from '../../interfaces/rowMeta'
import {ReactComponent, WidgetListField} from '../../interfaces/widget'
import ColumnFilter, {ColumnFilterOwnProps} from './ColumnFilter'
import ColumnSort from './ColumnSort'
import styles from './ColumnTitle.less'
import TemplatedTitle from '../TemplatedTitle/TemplatedTitle'
import {FieldType} from '../../interfaces/view'

export interface ColumnTitle {
    widgetName: string,
    widgetMeta: WidgetListField,
    rowMeta: RowMetaField,
    components?: {
        filter?: ReactComponent<ColumnFilterOwnProps>
    },
    className?: string,
}

export const notSortableFields: readonly FieldType[] = [
    FieldType.multivalue,
    FieldType.multivalueHover,
    FieldType.multifield,
    FieldType.hidden,
    FieldType.fileUpload,
    FieldType.inlinePickList,
    FieldType.hint
]

export const ColumnTitle: FunctionComponent<ColumnTitle> = (props) => {
    if (!props.widgetMeta && !props.rowMeta) {
        return null
    }
    const title = <TemplatedTitle
        widgetName={props.widgetName}
        title={props.widgetMeta.title}
    />
    if (!props.rowMeta) {
        return <div>{title}</div>
    }

    const sort = !notSortableFields.includes(props.widgetMeta.type) && <ColumnSort
        widgetName={props.widgetName}
        fieldKey={props.widgetMeta.key}
        className={styles.sort}
    />

    const filter = props.rowMeta.filterable &&
        (props.components?.filter
            ? <props.components.filter
                widgetName={props.widgetName}
                widgetMeta={props.widgetMeta}
                rowMeta={props.rowMeta}
            />
            : <ColumnFilter
                widgetName={props.widgetName}
                widgetMeta={props.widgetMeta}
                rowMeta={props.rowMeta}
            />
        )
    return <div className={cn(styles.container, props.className)}>
        {title}
        {filter}
        {sort}
    </div>
}

export default ColumnTitle
