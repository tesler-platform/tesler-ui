import React from 'react'
import cn from 'classnames'
import styles from './TableRow.less'

export interface AntTableRowProps {
    /**
     * Unique key for the row
     */
    'data-row-key': string,
    /**
     * Original row content, usually <td> elements
     */
    children: React.ReactChildren
    /**
     * Will be combined with internal class and passed to root element
     */
    className?: string,
    /**
     * Will be passed to root element
     */
    style?: React.CSSProperties,
    /**
     * Will be passed to root element
     */
    onMouseEnter?: (e: React.MouseEvent<HTMLTableRowElement>) => void,
    /**
     * Will be passed to root element
     */
    onMouseLeave?: (e: React.MouseEvent<HTMLTableRowElement>) => void,
    /**
     * Will be passed to root element
     */
    onClick?: (e: React.MouseEvent<HTMLTableRowElement>) => void,
    /**
     * Will be passed to root element
     */
    onContextMenu?: () => void
}

export interface TableRowProps extends AntTableRowProps {
    /**
     * Component which will be dispayed in controls column on row hover
     */
    operations?: React.ReactNode
}

/**
 * M<tr> element extended with common row handlers and additional column for controls.
 */
export const TableRow: React.FC<TableRowProps> = (props) => {
    const { children, className, operations, onMouseEnter, onMouseLeave, ...rest } = props

    return <tr className={cn(styles.row, props.className)} {...rest}>
        {props.children}
        { props.operations &&
            <td className={styles.controls}>
                <div className={styles.trigger}>
                    {props.operations}
                </div>
            </td>
        }
    </tr>
}

export default React.memo(TableRow)
