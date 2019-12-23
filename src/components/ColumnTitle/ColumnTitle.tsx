import React, {FunctionComponent} from 'react'
import {RowMetaField} from '../../interfaces/rowMeta'
import {WidgetListField} from '../../interfaces/widget'
import ColumnFilter from './ColumnFilter'
import ColumnSort from './ColumnSort'
import styles from './ColumnTitle.less'

export interface ColumnTitle {
    widgetName: string,
    widgetMeta: WidgetListField,
    rowMeta: RowMetaField
}

export const ColumnTitle: FunctionComponent<ColumnTitle> = (props) => {
    if (!props.widgetMeta && !props.rowMeta) {
        return null
    }
    if (!props.rowMeta) {
        return <div>{props.widgetMeta.title}</div>
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
        {props.widgetMeta.title}
        {filter}
        {sort}
    </div>
}

export default ColumnTitle
