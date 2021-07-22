import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { $do } from '../../../actions/actions'
import { Store } from '../../../interfaces/store'
import { WidgetTableMeta, PaginationMode } from '../../../interfaces/widget'
import Popup, { PopupProps } from '../../ui/Popup/Popup'
import { createMapDispatchToProps } from '../../../utils/redux'
import styles from './PickListPopup.less'
import { Table, Skeleton } from 'antd'
import { ColumnProps } from 'antd/es/table'
import { DataItem, PickMap } from '../../../interfaces/data'
import { ChangeDataItemPayload } from '../../Field/Field'
import HierarchyTable from '../../../components/HierarchyTable/HierarchyTable'
import FullHierarchyTable from '../../FullHierarchyTable/FullHierarchyTable'
import ColumnTitle from '../../ColumnTitle/ColumnTitle'
import { RowMetaField } from '../../../interfaces/rowMeta'
import { buildBcUrl } from '../../../utils/strings'
import { FieldType } from '../../../interfaces/view'
import Pagination from '../../ui/Pagination/Pagination'
import cn from 'classnames'

export interface PickListPopupActions {
    onChange: (payload: ChangeDataItemPayload) => void
    onClose: () => void
}

export interface PickListPopupOwnProps extends Omit<PopupProps, 'bcName' | 'children' | 'showed'> {
    widget: WidgetTableMeta
    className?: string
    components?: {
        title?: React.ReactNode
        table?: React.ReactNode
        footer?: React.ReactNode
    }
    disableScroll?: boolean
}

export interface PickListPopupProps extends PickListPopupOwnProps {
    /**
     * @deprecated TODO: Remove in 2.0.0, now handled by Widget.tsx
     */
    showed?: boolean

    data: DataItem[]
    pickMap: PickMap
    cursor: string
    parentBCName: string
    bcLoading: boolean
    rowMetaFields: RowMetaField[]
}

/**
 *
 * @param props
 * @category Widgets
 */
export const PickListPopup: FunctionComponent<PickListPopupProps & PickListPopupActions> = ({
    showed,
    data,
    pickMap,
    cursor,
    parentBCName,
    bcLoading,
    rowMetaFields,
    widget,
    className,
    components,
    disableScroll,
    onChange,
    onClose,
    ...rest
}) => {
    const columns: Array<ColumnProps<DataItem>> = widget.fields
        .filter(item => item.type !== FieldType.hidden && !item.hidden)
        .map(item => {
            const fieldRowMeta = rowMetaFields?.find(field => field.key === item.key)
            return {
                title: <ColumnTitle widgetName={widget.name} widgetMeta={item} rowMeta={fieldRowMeta} />,
                key: item.key,
                dataIndex: item.key,
                render: (text, dataItem) => {
                    return text
                }
            }
        })

    const onRow = React.useCallback(
        (rowData: DataItem) => {
            return {
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                    if (cursor) {
                        Object.keys(pickMap).forEach(field => {
                            onChange({
                                bcName: parentBCName,
                                cursor: cursor,
                                dataItem: { [field]: rowData[pickMap[field]] }
                            })
                        })
                    }
                    onClose()
                }
            }
        },
        [pickMap, onChange, parentBCName, cursor, onClose]
    )

    const defaultTitle = React.useMemo(
        () => (
            <div>
                <h1 className={styles.title}>{widget.title}</h1>
            </div>
        ),
        [widget.title]
    )
    const title = components?.title === undefined ? defaultTitle : components.title

    const defaultFooter = React.useMemo(
        () => (
            <div className={styles.footerContainer}>
                {!widget.options?.hierarchyFull && (
                    <div className={styles.pagination}>
                        <Pagination bcName={widget.bcName} mode={PaginationMode.page} widgetName={widget.name} />
                    </div>
                )}
            </div>
        ),
        [widget.options?.hierarchyFull, widget.bcName, widget.name]
    )
    const footer = components?.footer === undefined ? defaultFooter : components.footer

    const defaultTable =
        widget.options?.hierarchy || widget.options?.hierarchyFull ? (
            widget.options.hierarchyFull ? (
                <FullHierarchyTable meta={widget} onRow={onRow} />
            ) : (
                <HierarchyTable meta={widget} onRow={onRow} />
            )
        ) : (
            <div>
                {/* TODO: Replace with TableWidget */}
                <Table className={styles.table} columns={columns} dataSource={data} rowKey="id" onRow={onRow} pagination={false} />
            </div>
        )
    const table = bcLoading ? (
        <Skeleton loading paragraph={{ rows: 5 }} />
    ) : components?.table === undefined ? (
        defaultTable
    ) : (
        components.table
    )

    return (
        <Popup
            title={title}
            size="large"
            showed
            onOkHandler={onClose}
            onCancelHandler={onClose}
            bcName={widget.bcName}
            widgetName={widget.name}
            disablePagination={widget.options?.hierarchyFull}
            footer={footer}
            {...rest}
            className={cn(className, { [styles.disableScroll]: disableScroll })}
        >
            <div>{table}</div>
        </Popup>
    )
}

function mapStateToProps(store: Store, props: PickListPopupOwnProps) {
    const bcName = props.widget.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const fields = bcUrl && store.view.rowMeta[bcName]?.[bcUrl]?.fields
    const bc = store.screen.bo.bc[bcName]
    const parentBCName = bc?.parentName
    return {
        pickMap: store.view.pickMap,
        data: store.data[props.widget.bcName],
        cursor: store.screen.bo.bc[parentBCName]?.cursor,
        parentBCName: bc?.parentName,
        bcLoading: bc?.loading,
        rowMetaFields: fields
    }
}

const mapDispatchToProps = createMapDispatchToProps(
    (props: PickListPopupOwnProps) => {
        return {
            bcName: props.widget.bcName
        }
    },
    ctx => {
        return {
            onChange: (payload: ChangeDataItemPayload) => {
                ctx.dispatch($do.changeDataItem(payload))
            },
            onClose: () => {
                ctx.dispatch($do.viewClearPickMap(null))
                ctx.dispatch($do.closeViewPopup(null))
                ctx.dispatch($do.bcRemoveAllFilters({ bcName: ctx.props.bcName }))
            }
        }
    }
)

/**
 * @category Widgets
 */
const PickListPopupConnected = connect(mapStateToProps, mapDispatchToProps)(PickListPopup)

export default PickListPopupConnected
