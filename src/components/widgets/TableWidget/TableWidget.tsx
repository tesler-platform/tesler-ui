import React, { FunctionComponent } from 'react'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import {
    Table,
    Menu,
    Dropdown,
    Icon,
    Skeleton
} from 'antd'
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
import {useWidgetOperations} from '../../../hooks'
import {Operation, OperationGroup} from '../../../interfaces/operation'
import ColumnTitle from '../../ColumnTitle/ColumnTitle'
import cn from 'classnames'
import Pagination from '../../ui/Pagination/Pagination'
import {PaginationMode} from '../../../interfaces/widget'
import HierarchyTable from '../../../components/HierarchyTable/HierarchyTable'

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
    bcName: string,
    route: Route,
    cursor: string,
    selectedCell: ViewSelectedCell,
    pendingDataItem: PendingDataItem,
    hasNext: boolean,
    operations: Array<Operation | OperationGroup>,
    metaInProgress: boolean,
    onDrillDown: (widgetName: string, bcName: string, cursor: string, fieldKey: string) => void,
    onShowAll: (bcName: string, cursor: string, route: Route) => void,
    onOperationClick: (bcName: string, operationType: string, widgetName: string) => void,
    onSelectRow: (bcName: string, cursor: string) => void,
    onSelectCell: (cursor: string, widgetName: string, fieldKey: string) => void,
}

export const TableWidget: FunctionComponent<TableWidgetProps> = (props) => {

    if (props.meta.options && props.meta.options.hierarchy) {
        return <HierarchyTable
            meta={props.meta}
            showPagination
        />
    }

    // Набор рефов для работы меню операций строки
    const floatMenuRef = React.useRef(null)
    const tableContainerRef = React.useRef(null)
    const tableBodyRef = React.useRef(null)
    const floatMenuHoveredRecord = React.useRef('')
    const floatMenuIsOpened = React.useRef(false)
    const mouseAboveRow = React.useRef(false)
    const expectedFloatMenuTopValue = React.useRef('') // положение меню, которое должно быть выставлено после закрытия

    const onTableMouseEnter = React.useCallback(
        () => {
            if (floatMenuRef.current) {
                floatMenuRef.current.classList.add(styles.showMenu)
            }
        },
        []
    )

    const onTableMouseLeave = React.useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            if (!floatMenuIsOpened.current && floatMenuRef.current) {
                if (event.relatedTarget) {
                    let checkElement = event.relatedTarget as HTMLElement
                    while (checkElement) {
                        if (checkElement === floatMenuRef.current) {
                            return
                        }
                        checkElement = checkElement.parentElement
                    }
                }

                floatMenuRef.current.classList.remove(styles.showMenu)
            }
        },
        []
    )

    const onFloatMenuMouseLeave = React.useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            if (!floatMenuIsOpened.current && tableBodyRef.current) {
                if (event.relatedTarget) {
                    let checkElement = event.relatedTarget as HTMLElement
                    while (checkElement) {
                        if (checkElement === tableBodyRef.current) {
                            return
                        }
                        checkElement = checkElement.parentElement
                    }
                }

                floatMenuRef.current.classList.remove(styles.showMenu)
            }
        },
        []
    )

    React.useEffect(() => {
        if (tableContainerRef.current) {
            const table = tableContainerRef.current.querySelector('.ant-table-tbody')
            if (table) {
                tableBodyRef.current = table
                if (!table.onmouseenter) {
                    table.onmouseenter = onTableMouseEnter
                }
                if (!table.onmouseleave) {
                    table.onmouseleave = onTableMouseLeave
                }
            }
        }
    }, [])

    const onTableRow = React.useCallback(
        (record, index) => {
            return {
                onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
                    mouseAboveRow.current = true

                    if (!floatMenuRef.current || !tableContainerRef.current) {
                        return
                    }

                    const tableRow = event.currentTarget
                    const tableContainerRect = tableContainerRef.current.getBoundingClientRect()
                    const tableRowRect = tableRow.getBoundingClientRect()

                    const floatMenuTopValue = `${tableRowRect.top - tableContainerRect.top + 17}px`
                    expectedFloatMenuTopValue.current = floatMenuTopValue

                    if (!floatMenuIsOpened.current) {
                        floatMenuRef.current.style.top = floatMenuTopValue
                        floatMenuHoveredRecord.current = record.id
                    }
                },
                onMouseLeave: () => {
                    mouseAboveRow.current = false
                }
            }
        },
        []
    )

    const onMenuVisibilityChange = React.useCallback(
        (visibility: boolean) => {
            floatMenuIsOpened.current = visibility
            if (visibility) {
                if (floatMenuHoveredRecord.current && floatMenuHoveredRecord.current !== props.cursor) {
                    props.onSelectRow(props.bcName, floatMenuHoveredRecord.current)
                }
            } else {
                if (!mouseAboveRow.current) {
                    floatMenuRef.current.classList.remove(styles.showMenu)
                } else if (expectedFloatMenuTopValue.current) {
                    floatMenuRef.current.style.top = expectedFloatMenuTopValue.current
                }
            }
        },
        [props.cursor, props.onSelectRow, props.bcName, props.meta.name]
    )

    const operations = useWidgetOperations(props.operations, props.meta)

    const rowActionsMenu = React.useMemo(
        () => {
            const menuItemList: React.ReactNode[] = []
            operations.forEach((item: Operation | OperationGroup, index) => {
                if ((item as OperationGroup).actions) {
                    const groupOperations: React.ReactNode[] = [];
                    (item as OperationGroup).actions.forEach(operation => {
                        if (operation.scope === 'record') {
                            groupOperations.push(
                                <Menu.Item
                                    key={operation.type}
                                    onClick={() => {
                                        props.onOperationClick(props.bcName, operation.type, props.meta.name)
                                    }}
                                >
                                    { operation.icon && <Icon type={operation.icon} className={styles.icon} /> }
                                    {operation.text}
                                </Menu.Item>
                            )
                        }
                    })
                    if (groupOperations.length) {
                        menuItemList.push(
                            <Menu.ItemGroup key={item.type || item.text} title={item.text}>
                                {groupOperations.map((v) => v)}
                            </Menu.ItemGroup>
                        )
                    }
                }

                const ungroupedOperation = (item as Operation)
                if (ungroupedOperation.scope === 'record') {
                    menuItemList.push(
                        <Menu.Item
                            key={item.type}
                            onClick={() => {
                                floatMenuIsOpened.current = false
                                props.onOperationClick(props.bcName, ungroupedOperation.type, props.meta.name)
                            }}
                        >
                            { ungroupedOperation.icon && <Icon type={ungroupedOperation.icon} className={styles.icon} /> }
                            {item.text}
                        </Menu.Item>
                    )
                }
            })

            return <Menu>
                {(props.metaInProgress)
                    ? <Menu.Item disabled>
                        <div className={styles.floatMenuSkeletonWrapper}>
                            <Skeleton active />
                        </div>
                    </Menu.Item>
                    : (menuItemList.length)
                        ? menuItemList.map((item) => {
                            return item
                        })
                        : <Menu.Item disabled>
                            Нет доступных операций
                        </Menu.Item>
                }
            </Menu>
        },
        [operations, props.meta.name, props.onOperationClick, props.bcName, props.metaInProgress]
    )

    const processCellClick = (recordId: string, fieldKey: string) => {
        props.onSelectCell(recordId, props.meta.name, fieldKey)
    }

    const columns: Array<ColumnProps<DataItem>> = props.meta.fields.map((item: WidgetListField) => {
        const fieldRowMeta = props.rowMetaFields && props.rowMetaFields.find(field => field.key === item.key)
        return {
            title: <ColumnTitle
                widgetName={props.meta.name}
                widgetMeta={item}
                rowMeta={fieldRowMeta}
            />,
            key: item.key,
            dataIndex: item.key,
            width: item.width,
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
            onCell: (record, rowIndex) => {
                return (!props.allowEdit)
                    ? null
                    : {
                        onDoubleClick: (event) => {
                            processCellClick(record.id, item.key)
                        }
                    }
            }
        }
    })

    const handleShowAll = () => {
        props.onShowAll(props.bcName, props.cursor, props.route)
    }

    return <div
        className={styles.tableContainer}
        ref={tableContainerRef}
    >
        { props.limitBySelf &&
            <ActionLink onClick={handleShowAll}>Показать остальные записи</ActionLink>
        }
        <Table
            className={cn(
                styles.table,
                {[styles.tableWithRowMenu]: props.showRowActions}
            )}
            columns={columns}
            dataSource={props.data}
            rowKey="id"
            rowSelection={props.rowSelection}
            pagination={false}
            onRow={(props.showRowActions) ? onTableRow : null}
        />
        {!props.disablePagination && <Pagination bcName={props.bcName} mode={props.paginationMode || PaginationMode.page} />}
        {(props.showRowActions) &&
        <div
            ref={floatMenuRef}
            className={styles.floatMenu}
            onMouseLeave={onFloatMenuMouseLeave}
        >
            <Dropdown
                placement="bottomRight"
                trigger={['click']}
                onVisibleChange={onMenuVisibilityChange}
                overlay={rowActionsMenu}
                getPopupContainer={trigger => trigger.parentElement}
            >
                <div className={styles.dots}>...</div>
            </Dropdown>
        </div>
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
    const operations = store.view.rowMeta[bcName]
        && store.view.rowMeta[bcName][bcUrl]
        && store.view.rowMeta[bcName][bcUrl].actions
    return {
        data: store.data[ownProps.meta.bcName],
        rowMetaFields: fields,
        limitBySelf,
        bcName,
        route: store.router,
        cursor,
        hasNext,
        selectedCell: store.view.selectedCell,
        pendingDataItem: cursor && store.view.pendingDataChanges[bcName] && store.view.pendingDataChanges[bcName][cursor],
        operations,
        metaInProgress: !!store.view.metaInProgress[bcName]
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onSelectCell: (cursor: string, widgetName: string, fieldKey: string) => {
            dispatch($do.selectTableCellInit({ widgetName, rowId: cursor, fieldKey }))
        },
        onShowAll: (bcName: string, cursor: string, route: Route) => {
            dispatch($do.showAllTableRecordsInit({ bcName, cursor, route }))
        },
        onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => {
            dispatch($do.userDrillDown({widgetName, cursor, bcName, fieldKey}))
        },
        onOperationClick: (bcName: string, operationType: string, widgetName: string) => {
            dispatch($do.sendOperation({ bcName, operationType, widgetName }))
        },
        onSelectRow: (bcName: string, cursor: string) => {
            dispatch($do.bcSelectRecord({ bcName, cursor }))
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TableWidget)
