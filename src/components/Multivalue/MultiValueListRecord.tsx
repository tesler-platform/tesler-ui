import React, {FunctionComponent} from 'react'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import {$do} from '../../actions/actions'
import {MultivalueSingleValue} from '../../interfaces/data'
import cn from 'classnames'
import styles from './MultiValueListRecord.less'
import {DrillDownType} from '../../interfaces/router'
import {store} from '../../Provider'
import ActionLink from '../ui/ActionLink/ActionLink'

export interface MultiValueListRecordOwnProps {
    multivalueSingleValue: MultivalueSingleValue,
    isFloat: boolean
}

export interface MultiValueListRecordProps extends MultiValueListRecordOwnProps {
    onDrillDown: (drillDownUrl: string, drillDownType: DrillDownType) => void,
}

const MultiValueListRecord: FunctionComponent<MultiValueListRecordProps> = (props) => {
    const handleDrillDown = () => {
        props.onDrillDown(
            props.multivalueSingleValue.options.drillDown,
            props.multivalueSingleValue.options.drillDownType
        )
    }
    return <div className={styles.fieldAreaFloat}>
        {props.multivalueSingleValue.options && props.multivalueSingleValue.options.hint &&
        <div className={cn({
            [styles.hintFloat]: props.isFloat,
            [styles.hintBase]: !props.isFloat
        })}>
            {props.multivalueSingleValue.options.hint}
        </div>}
        <div>
            { (props.multivalueSingleValue.options.drillDown)
                ? <ActionLink onClick={handleDrillDown}>
                    {props.multivalueSingleValue.value}
                </ActionLink>
                : props.multivalueSingleValue.value
            }
        </div>
    </div>
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onDrillDown: (drillDownUrl: string, drillDownType: DrillDownType) => {
            const route = store.getState().router
            dispatch($do.drillDown({
                url: drillDownUrl,
                drillDownType: drillDownType,
                route
            }))
        }
    }
}

export default connect(null, mapDispatchToProps)(MultiValueListRecord)
