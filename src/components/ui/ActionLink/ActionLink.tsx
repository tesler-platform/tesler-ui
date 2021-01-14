import React from 'react'
import cn from 'classnames'
import * as styles from './ActionLink.less'

export interface IActionLinkProps {
    className?: string
    children?: React.ReactNode
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

/**
 *
 * @param props
 * @category Components
 */
const ActionLink = (props: IActionLinkProps) => {
    const handleClick = React.useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault()
            e.stopPropagation()
            if (props.onClick) {
                props.onClick(e)
            }
        },
        [props.onClick]
    )
    return (
        <a className={cn(styles.ActionLink, props.className)} onClick={handleClick}>
            {props.children}
        </a>
    )
}

/**
 * @category Components
 */
const MemoizedActionLink = React.memo(ActionLink)

export default MemoizedActionLink
