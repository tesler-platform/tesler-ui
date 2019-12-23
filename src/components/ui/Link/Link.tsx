import React from 'react'
import {createLocation} from 'history'
import {historyObj} from '../../../reducers/router'

interface LinkProps {
    children: React.ReactNode,
    className: string,
    href: string
}

export default function Link(props: LinkProps) {
    const { className, href, ...rest } = props
    return <a
        className={className}
        href={historyObj.createHref(createLocation(href))}
        {...rest}
    >
        {props.children}
    </a>
}
