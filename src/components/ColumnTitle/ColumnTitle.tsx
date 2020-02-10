import React, {FunctionComponent} from 'react'
import {RowMetaField} from '../../interfaces/rowMeta'
import {WidgetListField} from '../../interfaces/widget'
import ColumnFilter from './ColumnFilter'
import ColumnSort from './ColumnSort'
import styles from './ColumnTitle.less'
import TemplatedTitle from '../TemplatedTitle/TemplatedTitle'

export interface ColumnTitle {
    widgetName: string,
    widgetMeta: WidgetListField,
    rowMeta: RowMetaField
}

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

    const filterable = props.rowMeta.filterable
    const sort = <ColumnSort
        widgetName={props.widgetName}
        fieldKey={props.widgetMeta.key}
        className={styles.sort}
    />
    const filter = filterable &&
        <ColumnFilter
            widgetName={props.widgetName}
            widgetMeta={props.widgetMeta}
            rowMeta={props.rowMeta}
        />
    return <div className={styles.container}>
        {title}
        {filter}
        {sort}
    </div>
}

export default ColumnTitle
