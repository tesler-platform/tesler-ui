import React, { FunctionComponent } from 'react'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import {Table} from 'antd'
import {ColumnProps, TableRowSelection} from 'antd/es/table'
import ActionLink from '../../ui/ActionLink/ActionLink'
import {$do} from '../../../actions/actions'
import {Store} from '../../../interfaces/store'
import {WidgetListField, WidgetTableMeta} from '../../../interfaces/widget'
import {RowMetaField} from '../../../interfaces/rowMeta'
import {DataItem, MultivalueSingleValue, PendingDataItem} from '../../../interfaces/data'
import {buildBcUrl} from '../../../utils/strings'
import * as styles from './TableWidget.less'
import {FieldType, ViewSelectedCell} from '../../../interfaces/view'
import Field, {emptyMultivalue} from '../../Field/Field'
import MultivalueHover from '../../ui/Multivalue/MultivalueHover'
import {Route} from '../../../interfaces/router'
import ColumnTitle from '../../ColumnTitle/ColumnTitle'
import cn from 'classnames'
import Pagination from '../../ui/Pagination/Pagination'
import {PaginationMode} from '../../../interfaces/widget'
import HierarchyTable from '../../../components/HierarchyTable/HierarchyTable'
import RowOperations from './RowOperations'
import TableRow, {AntTableRowProps} from './TableRow'
import {Operation, OperationGroup} from '../../../interfaces/operation'

interface TableWidgetOwnProps {
    meta: WidgetTableMeta,
    rowSelection?: TableRowSelection<DataItem>,
    showRowActions?: boolean,
    allowEdit?: boolean,
    paginationMode?: PaginationMode,
    disablePagination?: boolean
}

interface TableWidgetProps extends TableWidgetOwnProps {
    data: DataItem[],
    rowMetaFields: RowMetaField[],
    limitBySelf: boolean,
    route: Route,
    cursor: string,
    selectedCell: ViewSelectedCell,
    hasNext: boolean,
    onShowAll: (bcName: string, cursor: string, route: Route) => void,
    onSelectCell: (cursor: string, widgetName: string, fieldKey: string) => void,
    /**
     * @deprecated TODO: Properties below not used anymore and will be removed in 2.0.0
     */
    bcName?: string, // Use meta.bcName instead
    operations?: Array<Operation | OperationGroup>,
    metaInProgress?: boolean,
    pendingDataItem?: PendingDataItem,
    onOperationClick?: (bcName: string, operationType: string, widgetName: string) => void,
    onSelectRow?: (bcName: string, cursor: string) => void
    onDrillDown?: (widgetName: string, bcName: string, cursor: string, fieldKey: string) => void,
}

export const TableWidget: FunctionComponent<TableWidgetProps> = (props) => {
    // Switch to hierarchy mode if necessary
    if (props.meta.options && props.meta.options.hierarchy) {
        return <HierarchyTable meta={props.meta} showPagination />
    }
    // Customize row component to show operations hover
    const tableComponents = React.useMemo(() => ({
        body: {
            row: (rowProps: AntTableRowProps) => {
                const popup = props.showRowActions
                    ? <RowOperations selectedKey={rowProps['data-row-key']} widgetMeta={props.meta} />
                    : null
                return <TableRow {...rowProps} operations={popup} />
            }
        }
    }), [props.meta, props.showRowActions])
    // Create columns (TODO: Memoize)
    const visibleFields = props.meta.fields.filter((item: WidgetListField) => item.type !== FieldType.hidden)
    const columns: Array<ColumnProps<DataItem>> = visibleFields.map((item: WidgetListField, index) => {
        const fieldRowMeta = props.rowMetaFields && props.rowMetaFields.find(field => field.key === item.key)
        const lastColumn = visibleFields.length - 1 === index
        return {
            title: <ColumnTitle
                widgetName={props.meta.name}
                widgetMeta={item}
                rowMeta={fieldRowMeta}
            />,
            key: item.key,
            dataIndex: item.key,
            width: item.width,
            colSpan: props.showRowActions && lastColumn ? 2 : undefined,
            render: (text, dataItem) => {
                if (item.type === FieldType.multivalue) {
                    return <MultivalueHover
                        data={(dataItem[item.key] || emptyMultivalue) as MultivalueSingleValue[]}
                        displayedValue={item.displayedKey && dataItem[item.displayedKey]}
                    />
                }

                const editMode = props.allowEdit && (props.selectedCell && item.key === props.selectedCell.fieldKey
                    && props.meta.name === props.selectedCell.widgetName && dataItem.id === props.selectedCell.rowId
                    && props.cursor === props.selectedCell.rowId
                )

                return <div>
                    <Field
                        data={dataItem}
                        bcName={props.meta.bcName}
                        cursor={dataItem.id}
                        widgetName={props.meta.name}
                        widgetFieldMeta={item}
                        readonly={!editMode}
                        forceFocus={editMode}
                    />
                </div>
            },
            onCell: record => {
                return !props.allowEdit
                    ? null
                    : {
                        onDoubleClick: (event) => {
                            props.onSelectCell(record.id, props.meta.name, item.key)
                        }
                    }
            }
        }
    })

    return <div className={styles.tableContainer}>
        { props.limitBySelf &&
            <ActionLink onClick={() => props.onShowAll(props.meta.bcName, props.cursor, props.route)}>
                Показать остальные записи
            </ActionLink>
        }
        <Table
            className={cn(
                styles.table,
                { [styles.tableWithRowMenu]: props.showRowActions }
            )}
            components={tableComponents}
            columns={columns}
            dataSource={props.data}
            rowKey="id"
            rowSelection={props.rowSelection}
            pagination={false}
        />
        { !props.disablePagination &&
            <Pagination
                bcName={props.meta.bcName}
                mode={props.paginationMode || PaginationMode.page}
            />
        }
    </div>
}

function mapStateToProps(store: Store, ownProps: TableWidgetOwnProps) {
    const bcName = ownProps.meta.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const fields = bcUrl
        && store.view.rowMeta[bcName]
        && store.view.rowMeta[bcName][bcUrl]
        && store.view.rowMeta[bcName][bcUrl].fields
    const bc = store.screen.bo.bc[bcName]
    const cursor = bc && bc.cursor
    const hasNext = bc && bc.hasNext
    const limitBySelf = cursor && store.router.bcPath && store.router.bcPath.includes(`${bcName}/${cursor}`)
    return {
        data: store.data[ownProps.meta.bcName],
        rowMetaFields: fields,
        limitBySelf,
        route: store.router,
        cursor,
        hasNext,
        selectedCell: store.view.selectedCell
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onSelectCell: (cursor: string, widgetName: string, fieldKey: string) => {
            dispatch($do.selectTableCellInit({ widgetName, rowId: cursor, fieldKey }))
        },
        onShowAll: (bcName: string, cursor: string, route: Route) => {
            dispatch($do.showAllTableRecordsInit({ bcName, cursor, route }))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TableWidget)
