import React, {FunctionComponent} from 'react'
import {createLocation} from 'history'
import {historyObj} from '../../../reducers/router'

export interface LinkProps {
    children: React.ReactNode,
    className: string,
    href: string
}

export const Link: FunctionComponent<LinkProps> = (props) => {
    const { className, href, ...rest } = props
    return <a
        className={className}
        href={historyObj.createHref(createLocation(href))}
        {...rest}
    >
        {props.children}
    </a>
}

export default Link
