import React, { FunctionComponent } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { $do } from '../../../actions/actions'
import { Store } from '../../../interfaces/store'
import { WidgetTableMeta, PaginationMode } from '../../../interfaces/widget'
import Popup, { PopupProps } from '../../ui/Popup/Popup'
import styles from './PickListPopup.less'
import { Table, Skeleton, Spin } from 'antd'
import { ColumnProps } from 'antd/es/table'
import { DataItem, PickMap, PendingDataItem } from '../../../interfaces/data'
import { ChangeDataItemPayload } from '../../Field/Field'
import HierarchyTable from '../../../components/HierarchyTable/HierarchyTable'
import FullHierarchyTable from '../../FullHierarchyTable/FullHierarchyTable'
import ColumnTitle from '../../ColumnTitle/ColumnTitle'
import { RowMetaField } from '../../../interfaces/rowMeta'
import { buildBcUrl } from '../../../utils/strings'
import { FieldType } from '../../../interfaces/view'
import Pagination from '../../ui/Pagination/Pagination'
import cn from 'classnames'

const emptyObject = {}

export interface PickListPopupActions {
    /**
     * @deprecated
     */
    onChange?: (payload: ChangeDataItemPayload) => void
    /**
     * @deprecated
     */
    onClose?: () => void
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

    /**
     * @deprecated
     */
    data?: DataItem[]
    /**
     * @deprecated
     */
    pickMap?: PickMap
    /**
     * @deprecated
     */
    cursor?: string
    /**
     * @deprecated
     */
    parentBCName?: string
    /**
     * @deprecated
     */
    bcLoading?: boolean
    /**
     * @deprecated
     */
    handledForceActive?: PendingDataItem
    /**
     * @deprecated
     */
    rowMetaFields?: RowMetaField[]
}

/**
 *
 * @param props
 * @category Widgets
 */
export const PickListPopup: FunctionComponent<PickListPopupProps & PickListPopupActions> = ({
    showed: showedDeprecated,
    data: dataDeprecated,
    pickMap: pickMapDeprecated,
    cursor: cursorDeprecated,
    parentBCName: parentBCNameDeprecated,
    bcLoading: bcLoadingDeprecated,
    rowMetaFields: rowMetaFieldsDeprecated,
    handledForceActive: handledForceActiveDeprecated,
    widget,
    className,
    components,
    disableScroll,
    onChange: onChangeDeprecated,
    onClose: onCloseDeprecated,
    ...rest
}) => {
    const { bcName, title } = widget
    const { pending, handledForceActive, pickMap, data, cursor, parentBCName, bcLoading, rowMetaFields } = useSelector((state: Store) => {
        const bcUrl = buildBcUrl(bcName, true)
        const bc = state.screen.bo.bc[bcName]
        const pBCName = bc?.parentName
        return {
            pending: state.session.pendingRequests?.filter(item => item.type === 'force-active'),
            handledForceActive: state.view.handledForceActive[bcName]?.[bc.cursor] || emptyObject,
            pickMap: state.view.pickMap,
            data: state.data[bcName],
            cursor: state.screen.bo.bc[pBCName]?.cursor,
            parentBCName: bc?.parentName,
            bcLoading: bc?.loading,
            rowMetaFields: bcUrl && state.view.rowMeta[bcName]?.[bcUrl]?.fields
        }
    }, shallowEqual)
    const dispatch = useDispatch()
    const onChange = React.useCallback((payload: ChangeDataItemPayload) => dispatch($do.changePopupValueAndClose(payload)), [dispatch])
    const onClose = React.useCallback(() => {
        dispatch($do.viewClearPickMap(null))
        dispatch($do.closeViewPopup(null))
        dispatch($do.bcRemoveAllFilters({ bcName }))
    }, [dispatch, bcName])
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
                        const dataItem: PendingDataItem = {}
                        Object.keys(pickMap).forEach(field => {
                            dataItem[field] = rowData[pickMap[field]]
                        })
                        onChange({
                            bcName: parentBCName,
                            cursor,
                            dataItem
                        })
                    }
                }
            }
        },
        [pickMap, onChange, parentBCName, cursor, rowMetaFields, handledForceActive]
    )

    const defaultTitle = React.useMemo(() => <h1 className={styles.title}>{title}</h1>, [title])
    const titleComponent = components?.title === undefined ? defaultTitle : components.title

    const defaultFooter = React.useMemo(
        () => (
            <div className={styles.footerContainer}>
                {!widget.options?.hierarchyFull && (
                    <div className={styles.pagination}>
                        <Pagination bcName={bcName} mode={PaginationMode.page} widgetName={widget.name} />
                    </div>
                )}
            </div>
        ),
        [widget.options?.hierarchyFull, bcName, widget.name]
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
            title={titleComponent}
            size="large"
            showed
            onOkHandler={onClose}
            onCancelHandler={onClose}
            bcName={bcName}
            widgetName={widget.name}
            disablePagination={widget.options?.hierarchyFull}
            footer={footer}
            {...rest}
            className={cn(styles.container, className, { [styles.disableScroll]: disableScroll })}
        >
            <Spin spinning={pending?.length > 0}>{table}</Spin>
        </Popup>
    )
}

/**
 * @category Widgets
 */
const PickListPopupConnected = React.memo(PickListPopup)

export default PickListPopupConnected
