import React from 'react'
import TemplatedTitle from '../../../TemplatedTitle/TemplatedTitle'
import { FieldType } from '../../../../interfaces/view'
import cn from 'classnames'
import styles from './InfoCell.less'
import { DataItem, MultivalueSingleValue } from '../../../../interfaces/data'
import Field from '../../../Field/Field'
import ActionLink from '../../../ui/ActionLink/ActionLink'
import { LayoutCol, LayoutRow, WidgetInfoField, WidgetInfoMeta } from '../../../../interfaces/widget'
import InfoValueWrapper from './InfoValueWrapper'
import MultiValueListRecord from '../../../Multivalue/MultiValueListRecord'

export interface ValueCellProps {
    row: LayoutRow
    col: LayoutCol
    cursor: string
    meta: WidgetInfoMeta
    data: DataItem
    flattenWidgetFields: WidgetInfoField[]
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
}
const emptyMultivalueField = [] as MultivalueSingleValue[]
export const InfoCell: React.FunctionComponent<ValueCellProps> = ({ flattenWidgetFields, col, row, data, meta, cursor, onDrillDown }) => {
    const field = flattenWidgetFields.find(item => item.key === col.fieldKey)
    const isMultiValue = field.type === FieldType.multivalue
    const dataId = data.id
    const separateDrillDownTitle = field.drillDown && (field.drillDownTitle || (field.drillDownTitleKey && data[field.drillDownTitleKey]))
    const handleDrillDown = React.useCallback(() => {
        onDrillDown(meta.name, dataId, meta.bcName, field.key)
    }, [onDrillDown, meta, dataId, field.key])

    const ResultField = isMultiValue ? (
        ((data[field.key] || emptyMultivalueField) as MultivalueSingleValue[]).map((multiValueSingleValue, index) => {
            return <MultiValueListRecord key={index} isFloat={false} multivalueSingleValue={multiValueSingleValue} />
        })
    ) : (
        <>
            {field.hintKey && data[field.hintKey] && <div className={styles.hint}>{data[field.hintKey]}</div>}
            <Field
                bcName={meta.bcName}
                cursor={cursor}
                widgetName={meta.name}
                widgetFieldMeta={field}
                className={cn({ [styles.infoWidgetValue]: !!field.bgColorKey })}
                disableDrillDown={!!separateDrillDownTitle}
                readonly
            />
            {separateDrillDownTitle && (
                <div>
                    <ActionLink onClick={handleDrillDown}>{separateDrillDownTitle}</ActionLink>
                </div>
            )}
        </>
    )

    return (
        <InfoValueWrapper key={field.key} row={row} col={col}>
            {field.label?.length !== 0 && (
                <div className={styles.labelArea}>
                    <TemplatedTitle widgetName={meta.name} title={field.label} />
                </div>
            )}
            <div className={styles.fieldData}>{ResultField}</div>
        </InfoValueWrapper>
    )
}

InfoCell.displayName = 'InfoCell'

export default React.memo(InfoCell)
