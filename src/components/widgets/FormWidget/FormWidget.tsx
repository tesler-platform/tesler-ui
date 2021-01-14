import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Form, Row, Col } from 'antd'
import { Store } from '../../../interfaces/store'
import { WidgetFormMeta, WidgetFormField } from '../../../interfaces/widget'
import { RowMetaField } from '../../../interfaces/rowMeta'
import { buildBcUrl } from '../../../utils/strings'
import Field from '../../Field/Field'
import { useFlatFormFields } from '../../../hooks/useFlatFormFields'
import styles from './FormWidget.less'
import cn from 'classnames'
import { FieldType, PendingValidationFails, PendingValidationFailsFormat } from '../../../interfaces/view'
import TemplatedTitle from '../../TemplatedTitle/TemplatedTitle'

interface FormWidgetOwnProps {
    meta: WidgetFormMeta
}

interface FormWidgetProps extends FormWidgetOwnProps {
    cursor: string
    fields: RowMetaField[]
    metaErrors: Record<string, string>
    missingFields: Record<string, string>
}

/**
 *
 * @param props
 * @category Widgets
 */
export const FormWidget: FunctionComponent<FormWidgetProps> = props => {
    const hiddenKeys: string[] = []
    const flattenWidgetFields = useFlatFormFields<WidgetFormField>(props.meta.fields).filter(item => {
        const isHidden = item.type === FieldType.hidden || item.hidden
        if (isHidden) {
            hiddenKeys.push(item.key)
        }
        return !isHidden
    })
    const {
        meta: { bcName, name },
        cursor
    } = props

    const fields = React.useMemo(() => {
        return (
            <Row gutter={24}>
                {props.meta.options?.layout?.rows.map((row, index) => {
                    return (
                        <Row key={index}>
                            {row.cols
                                .filter(field => {
                                    const meta = props.fields?.find(item => item.key === field.fieldKey)
                                    return meta ? !meta.hidden : true
                                })
                                .filter(col => !hiddenKeys.includes(col.fieldKey))
                                .map((col, colIndex) => {
                                    const field = flattenWidgetFields.find(item => item.key === col.fieldKey)
                                    const disabled = props.fields?.find(item => item.key === field.key && item.disabled)
                                    const error = (!disabled && props.missingFields?.[field.key]) || props.metaErrors?.[field.key]
                                    return (
                                        <Col
                                            key={colIndex}
                                            span={col.span}
                                            className={cn({ [styles.colWrapper]: row.cols.length > 1 || col.span !== 24 })}
                                        >
                                            <Form.Item
                                                label={
                                                    field.type === 'checkbox' ? null : (
                                                        <TemplatedTitle widgetName={props.meta.name} title={field.label} />
                                                    )
                                                }
                                                validateStatus={error ? 'error' : undefined}
                                                help={error}
                                            >
                                                <Field
                                                    bcName={bcName}
                                                    cursor={cursor}
                                                    widgetName={name}
                                                    widgetFieldMeta={field}
                                                    disableHoverError={props.meta.options?.disableHoverError}
                                                />
                                            </Form.Item>
                                        </Col>
                                    )
                                })}
                        </Row>
                    )
                })}
            </Row>
        )
    }, [bcName, name, cursor, flattenWidgetFields, props.missingFields, props.metaErrors])

    return (
        <Form colon={false} layout="vertical">
            {fields}
        </Form>
    )
}

function mapStateToProps(store: Store, ownProps: FormWidgetOwnProps) {
    const bcName = ownProps.meta.bcName
    const bc = store.screen.bo.bc[bcName]
    const bcUrl = buildBcUrl(bcName, true)
    const rowMeta = bcUrl && store.view.rowMeta[bcName]?.[bcUrl]
    const fields = rowMeta?.fields
    const metaErrors = rowMeta?.errors
    const cursor = bc?.cursor
    const missingFields =
        store.view.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            ? (store.view.pendingValidationFails as PendingValidationFails)?.[bcName]?.[cursor]
            : store.view.pendingValidationFails
    return {
        cursor,
        fields,
        metaErrors,
        missingFields
    }
}

/**
 * @category Widgets
 */
const ConnectedFormWidget = connect(mapStateToProps)(FormWidget)

export default ConnectedFormWidget
