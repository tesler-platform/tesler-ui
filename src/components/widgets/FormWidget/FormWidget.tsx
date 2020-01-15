import React, {FunctionComponent} from 'react'
import {connect} from 'react-redux'
import {Form, Row, Col} from 'antd'
import {Store} from '../../../interfaces/store'
import {WidgetFormMeta, WidgetFormField} from '../../../interfaces/widget'
import {RowMetaField} from '../../../interfaces/rowMeta'
import {buildBcUrl} from '../../../utils/strings'
import Field from '../../Field/Field'
import {useFlatFormFields} from '../../../hooks/useFlatFormFields'
import styles from './FormWidget.less'
import cn from 'classnames'

interface FormWidgetOwnProps {
    meta: WidgetFormMeta,
}

interface FormWidgetProps extends FormWidgetOwnProps {
    cursor: string,
    fields: RowMetaField[],
    metaErrors: Record<string, string>,
    missingFields: Record<string, string>
}

export const FormWidget: FunctionComponent<FormWidgetProps> = (props) => {
    const flattenWidgetFields = useFlatFormFields<WidgetFormField>(props.meta.fields)
    const { meta: { bcName, name }, cursor } = props

    const fields = React.useMemo(() => {
        return <Row gutter={24}>
            {props.meta.options
            && props.meta.options.layout
            && props.meta.options.layout.rows.map((row, index) => {
                return <Row key={index}>
                    {row.cols
                    .filter(field => {
                        const meta = props.fields && props.fields.find(item => item.key === field.fieldKey)
                        return meta ? !meta.hidden : true
                    })
                    .map((col, colIndex) => {
                        const field = flattenWidgetFields.find(item => item.key === col.fieldKey)
                        const error = (props.missingFields && props.missingFields[field.key])
                            || props.metaErrors && props.metaErrors[field.key]
                        const fieldLabel = field.type === 'checkbox' ? null : field.label
                        return  <Col key={colIndex} span={col.span} className={cn(
                            {[styles.colWrapper]: row.cols.length > 1 || col.span !== 24}
                        )}>
                            <Form.Item
                                label={fieldLabel}
                                validateStatus={error ? 'error' : undefined}
                                help={error}
                            >
                                <Field
                                    bcName={bcName}
                                    cursor={cursor}
                                    widgetName={name}
                                    widgetFieldMeta={field}
                                />
                            </Form.Item>
                        </Col>
                    })}
                </Row>
            })}
        </Row>
    }, [bcName, name, cursor, flattenWidgetFields, props.missingFields, props.metaErrors])

    return <Form colon={false} layout="vertical">
        {fields}
    </Form>
}

function mapStateToProps(store: Store, ownProps: FormWidgetOwnProps) {
    const bcName = ownProps.meta.bcName
    const bc = store.screen.bo.bc[bcName]
    const bcUrl = buildBcUrl(bcName, true)
    const rowMeta = bcUrl
        && store.view.rowMeta[bcName]
        && store.view.rowMeta[bcName][bcUrl]
    const fields = rowMeta && rowMeta.fields
    const metaErrors = rowMeta && rowMeta.errors
    const missingFields = store.view.pendingValidationFails
    const cursor = bc && bc.cursor
    return {
        cursor,
        fields,
        metaErrors,
        missingFields
    }
}

export default connect(mapStateToProps)(FormWidget)
