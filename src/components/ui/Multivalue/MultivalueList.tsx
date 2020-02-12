import React from 'react'
import {MultivalueSingleValue} from '../../../interfaces/data'
import {MultivalueFieldMeta} from '../../../interfaces/widget'
import styles from './MultivalueList.less'
import cn from 'classnames'
import MultiValueListRecord from '../../Multivalue/MultiValueListRecord'

interface MultivalueListOwnProps {
    fieldTitle: React.ReactNode,
    field: MultivalueFieldMeta,
    data: MultivalueSingleValue[],
    isFloat: boolean,
    noLineSeparator: boolean,
    isColumnDirection?: boolean
}

const MultivalueList: React.FunctionComponent<MultivalueListOwnProps> = (props) => {

    return <div key={`${props.field.key}_${props.field.label}`} className={cn({
        [styles.fieldAreaFloat]: props.isFloat,
        [styles.fieldAreaBase]: !props.isFloat,
        [styles.noFieldSeparator]: props.noLineSeparator,
        [styles.fieldAreaDirection]: props.isColumnDirection
    })}>
        <div className={cn({
            [styles.labelAreaFloat]: props.isFloat,
            [styles.labelAreaBase]: !props.isFloat,
            [styles.lableDirection]: props.isColumnDirection
        })}>
            {props.fieldTitle}
        </div>
        <div className={cn({
            [styles.fieldDataFloat]: props.isFloat,
            [styles.fieldDataBase]: !props.isFloat
        })}>
            {props.data.map((multivalueSingleValue, index) => {
                return <MultiValueListRecord
                    key={index}
                    isFloat={props.isFloat}
                    multivalueSingleValue={multivalueSingleValue}
                />
            })}
        </div>
    </div>
}

export default React.memo(MultivalueList)
