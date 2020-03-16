import React from 'react'
import {WidgetField} from '../../../interfaces/widget'
import {DataItem} from '../../../interfaces/data'
import styles from './MultiField.less'
import Field from '../../Field/Field'
import cn from 'classnames'

interface MultiFieldProps {
    bcName: string,
    fields: WidgetField[],
    data: DataItem,
    cursor: string,
    widgetName: string,
    style: 'inline' | 'list'
}

const MultiField: React.FunctionComponent<MultiFieldProps> = (props) => {
    const valuesStyle = props.style === 'list' ? styles.listValues : styles.inlineValues
    const valueStyle = props.style === 'list' ? styles.listValue : styles.inlineValue
    const multiValueStyle = props.style === 'list' ? styles.listMultiValue : styles.inlineMultiValue
    return <div className={valuesStyle}>
        {props.fields.map(
            (fieldMeta) => {
                const data = props.data?.[fieldMeta.key]

                return (data || data === 0)
                    ? <div key={fieldMeta.key} className={valueStyle}>
                        <Field
                            bcName={props.bcName}
                            cursor={props.cursor}
                            widgetName={props.widgetName}
                            widgetFieldMeta={fieldMeta}
                            className={cn(
                                multiValueStyle,
                                {[styles.listMultiValueDrillDownText]: fieldMeta.drillDown,
                                    [styles.listMultiValueText]: !fieldMeta.drillDown,
                                })}
                            readonly
                        />
                    </div>
                    : null
            }
        )}
    </div>
}

export default React.memo(MultiField)
