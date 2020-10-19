import React from 'react'
import {Icon, Popover} from 'antd'
import {DataValue, MultivalueSingleValue} from '../../../interfaces/data'
import styles from './MultivalueHover.less'
import cn from 'classnames'
import SearchHighlight from '../SearchHightlight/SearchHightlight'
import {escapedSrc} from '../../../utils/strings'

export interface MultivalueHoverProps {
    data: MultivalueSingleValue[],
    displayedValue: DataValue,
    onDrillDown?: () => void,
    className?: string,
    filterValue?: string
}

const Multivalue: React.FunctionComponent<MultivalueHoverProps> = (props) => {
    const displayedItem = (props.displayedValue !== undefined && props.displayedValue !== null)
        ? <p className={cn(styles.displayedValue, props.className)} onClick={props.onDrillDown}>
            {props.filterValue
                ? <SearchHighlight
                    source={(props.displayedValue || '').toString()}
                    search={escapedSrc(props.filterValue)}
                    match={formatString => <b>{formatString}</b>}/>
                : props.displayedValue}
        </p>
        : <Icon className={cn(props.className)} type="left-circle" onClick={props.onDrillDown}/>
    const fields = props.data.map((multivalueSingleValue, index) => {
        return <div className={styles.multivalueFieldArea} key={index}>
            {multivalueSingleValue.options?.hint &&
            <div className={styles.multivalueHint}>
                {multivalueSingleValue.options.hint}
            </div>}
            <div>
                {multivalueSingleValue.value}
            </div>
        </div>
    })
    const content = <div className={styles.multivalueArea}>
        {fields}
    </div>
    return <Popover content={content} trigger="hover" placement="topLeft" >
        {displayedItem}
    </Popover>
}

export default React.memo(Multivalue)
