import React from 'react'
import styles from './ReadOnlyField.less'
import cn from 'classnames'
import ActionLink from '../ActionLink/ActionLink'

interface ReadOnlyFieldProps {
    backgroundColor?: string,
    className?: string,
    onDrillDown?: () => void,
    children: React.ReactNode
}

const ReadOnlyField: React.FunctionComponent<ReadOnlyFieldProps> = (props) => {
    return <span
        className={cn(
            styles.readOnlyField,
            {[styles.coloredField]: props.backgroundColor},
            props.className
        )}
        style={props.backgroundColor ? {backgroundColor: props.backgroundColor} : null}
    >
        {(props.onDrillDown)
            ? <ActionLink onClick={props.onDrillDown}>
                {props.children}
            </ActionLink>
            : props.children
        }
    </span>
}

export default React.memo(ReadOnlyField)
