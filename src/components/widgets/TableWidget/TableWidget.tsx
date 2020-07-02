import React, {FunctionComponent} from 'react'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import {Dropdown, Icon, Menu, Skeleton, Table} from 'antd'
import {ColumnProps, TableProps, TableRowSelection} from 'antd/es/table'
import ActionLink from '../../ui/ActionLink/ActionLink'
import {$do} from '../../../actions/actions'
import {Store} from '../../../interfaces/store'
import {PaginationMode, WidgetListField, WidgetTableMeta} from '../../../interfaces/widget'
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
import HierarchyTable from '../../../components/HierarchyTable/HierarchyTable'
import {BcFilter, FilterGroup} from '../../../interfaces/filters'
import {useTranslation} from 'react-i18next'
import FullHierarchyTable from '../../../components/FullHierarchyTable/FullHierarchyTable'
import {parseFilters} from '../../../utils/filters'
import Select from '../../ui/Select/Select'

type AdditionalAntdTableProps = Partial<Omit<TableProps<DataItem>, 'rowSelection'>>
export interface TableWidgetOwnProps extends AdditionalAntdTableProps {
    columnTitleComponent?: (options?: {
        widgetName: string,
        widgetMeta: WidgetListField,
        rowMeta: RowMetaField
    }) => React.ReactNode,
    meta: WidgetTableMeta,
    rowSelection?: TableRowSelection<DataItem>,
    showRowActions?: boolean,
    allowEdit?: boolean,
    paginationMode?: PaginationMode,
    disablePagination?: boolean,
    disableDots?: boolean,
    controlColumns?: Array<{column: ColumnProps<DataItem>, position: 'left' | 'right'}>
}

export interface TableWidgetProps extends TableWidgetOwnProps {
    data: DataItem[],
    rowMetaFields: RowMetaField[],
    limitBySelf: boolean,
    /**
     * @deprecated TODO: Remove in 2.0 in favor of `widgetName`
     */
    bcName?: string,
    widgetName?: string,
    /**
     * @deprecated TODO: Remove 2.0 as it is accessible from the store
     */
    route?: Route,
    cursor: string,
    selectedCell: ViewSelectedCell,
    /**
     * @deprecated TODO: Remove 2.0 as it is never used
     */
    pendingDataItem?: PendingDataItem,
    hasNext: boolean,
    operations: Array<Operation | OperationGroup>,
    metaInProgress: boolean,
    filters: BcFilter[],
    filterGroups: FilterGroup[],
    /**
     * @deprecated TODO: Remove 2.0 as it is never used
     */
    onDrillDown?: (widgetName: string, bcName: string, cursor: string, fieldKey: string) => void,
    // TODO: Remove `route` in 2.0 as it is accessible from the store; remove `bcName`
    onShowAll: (bcName: string, cursor: string, route: Route, widgetName: string) => void,
    onOperationClick: (bcName: string, operationType: string, widgetName: string) => void,
    onSelectRow: (bcName: string, cursor: string) => void,
    onSelectCell: (cursor: string, widgetName: string, fieldKey: string) => void,
    onRemoveFilters: (bcName: string) => void,
    onApplyFilter: (bcName: string, filter: BcFilter) => void,
    onForceUpdate: (bcName: string) => void
}

export const TableWidget: FunctionComponent<TableWidgetProps> = (props) => {
    const {
        meta,
        rowSelection,
        showRowActions,
        allowEdit,
        paginationMode,
        disablePagination,
        disableDots,
        controlColumns,
        data,
        rowMetaFields,
        limitBySelf,
        bcName,
        widgetName,
        route,
        cursor,
        selectedCell,
        pendingDataItem,
        hasNext,
        operations,
        metaInProgress,
        filters,
        filterGroups,
        onDrillDown,
        onShowAll,
        onOperationClick,
        onSelectRow,
        onSelectCell,
        onRemoveFilters,
        onApplyFilter,
        onForceUpdate,
        ...rest
    } = props
    if (props.meta.options) {
        if (props.meta.options.hierarchyFull) {
            return <FullHierarchyTable
                meta={props.meta}
            />
        }

        if (props.meta.options.hierarchy) {
            return <HierarchyTable
                meta={props.meta}
                showPagination
                widgetName={props.widgetName}
            />
        }
    }
    const isAllowEdit = (props.allowEdit ?? true) && !props.meta.options?.readOnly
    const {t} = useTranslation()

    // Refs for row operations popup
    const floatMenuRef = React.useRef(null)
    const tableContainerRef = React.useRef(null)
    const tableBodyRef = React.useRef(null)
    const floatMenuHoveredRecord = React.useRef('')
    const floatMenuIsOpened = React.useRef(false)
    const mouseAboveRow = React.useRef(false)
    const expectedFloatMenuTopValue = React.useRef('') // menu position after closing

    const onRowMouseEnterHandler = React.useCallback(
        (target: HTMLElement, recordId: string) => {
            mouseAboveRow.current = true

            // Should compare hovered record id with event target id, because function is called twice, when cursor enters table
            if ((!props.disableDots && !floatMenuRef.current)
                || !tableContainerRef.current
                || floatMenuHoveredRecord.current === recordId) {
                return
            }

            const tableContainerRect = tableContainerRef.current.getBoundingClientRect()
            const tableRowRect = target.getBoundingClientRect()

            const floatMenuTopValue = `${tableRowRect.top - tableContainerRect.top + 17}px`
            expectedFloatMenuTopValue.current = floatMenuTopValue

            floatMenuHoveredRecord.current = recordId
            if (!floatMenuIsOpened.current && floatMenuRef.current) {
                floatMenuRef.current.style.top = floatMenuTopValue
            }
        }, []
    )

    const onTableMouseEnter = React.useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            if (floatMenuRef.current) {
                floatMenuRef.current.classList.add(styles.showMenu)
            }

            /*
             * workaround: Table.onRow.onMouseEnter event isn't fired on chrome after menu disappear, when we select record menu item, that
             * located above another record.
             * https://github.com/facebook/react/issues/16566
             */
            if (!floatMenuIsOpened.current && tableBodyRef.current) {
                const elementMouseIsOver = document.elementFromPoint(event.clientX, event.clientY)
                if (elementMouseIsOver) {
                    let checkElement = elementMouseIsOver
                    while (checkElement) {
                        if (checkElement === tableBodyRef.current) {
                            return
                        }

                        if (checkElement.tagName === 'TR') {
                            const rowKey = checkElement.getAttribute('data-row-key')
                            if (rowKey) {
                                onRowMouseEnterHandler(checkElement as HTMLElement, rowKey)
                                return
                            }
                        }

                        checkElement = checkElement.parentElement
                    }
                }
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
                    onRowMouseEnterHandler(event.currentTarget, record.id)
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
                    props.onSelectRow(props.meta.bcName, floatMenuHoveredRecord.current)
                }
            } else {
                if (!mouseAboveRow.current && floatMenuRef.current) {
                    floatMenuRef.current.classList.remove(styles.showMenu)
                } else if (expectedFloatMenuTopValue.current && floatMenuRef.current) {
                    floatMenuRef.current.style.top = expectedFloatMenuTopValue.current
                }
            }
        },
        [props.cursor, props.onSelectRow, props.meta.bcName, props.meta.name]
    )

    const operationList = useWidgetOperations(props.operations, props.meta)

    const rowActionsMenu = React.useMemo(
        () => {
            const menuItemList: React.ReactNode[] = []
            operationList.forEach((item: Operation | OperationGroup, index) => {
                if ((item as OperationGroup).actions) {
                    const groupOperations: React.ReactNode[] = [];
                    (item as OperationGroup).actions.forEach(operation => {
                        if (operation.scope === 'record') {
                            groupOperations.push(
                                <Menu.Item
                                    key={operation.type}
                                    onClick={() => {
                                        onMenuVisibilityChange(false) // Dropdown bug: doesn't call onVisibleChange on menu item click
                                        props.onOperationClick(props.meta.bcName, operation.type, props.meta.name)
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
                                onMenuVisibilityChange(false) // Dropdown bug: doesn't call onVisibleChange on menu item click
                                props.onOperationClick(props.meta.bcName, ungroupedOperation.type, props.meta.name)
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
                            {t('No operations available')}
                        </Menu.Item>
                }
            </Menu>
        },
        [operationList, props.meta.name, props.onOperationClick, props.meta.bcName, props.metaInProgress]
    )

    const processCellClick = (recordId: string, fieldKey: string) => {
        props.onSelectCell(recordId, props.meta.name, fieldKey)
    }

    const columns: Array<ColumnProps<DataItem>> = React.useMemo(() => {
        return props.meta.fields
            .filter((item: WidgetListField) => item.type !== FieldType.hidden && !item.hidden)
            .map((item: WidgetListField) => {
                const fieldRowMeta = props.rowMetaFields?.find(field => field.key === item.key)
                return {
                    title: props.columnTitleComponent
                        ? props.columnTitleComponent({widgetName: props.meta.name, widgetMeta: item, rowMeta: fieldRowMeta})
                        : <ColumnTitle
                        widgetName={props.meta.name}
                        widgetMeta={item}
                        rowMeta={fieldRowMeta}
                    />,
                    key: item.key,
                    dataIndex: item.key,
                    width: item.width,
                    render: (text: string, dataItem: DataItem) => {
                        if (item.type === FieldType.multivalue) {
                            return <MultivalueHover
                                data={(dataItem[item.key] || emptyMultivalue) as MultivalueSingleValue[]}
                                displayedValue={item.displayedKey && dataItem[item.displayedKey]}
                            />
                        }

                        const editMode = isAllowEdit && (props.selectedCell && item.key === props.selectedCell.fieldKey
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
                    onCell: (record: DataItem, rowIndex: number) => {
                        return (!isAllowEdit)
                            ? null
                            : {
                                onDoubleClick: (event: React.MouseEvent) => {
                                    processCellClick(record.id, item.key)
                                }
                            }
                    }
                }
            })
    }, [props.meta.fields, props.rowMetaFields, props.meta.name, props.selectedCell, props.cursor, isAllowEdit,
        props.selectedCell?.fieldKey, props.selectedCell?.rowId, props.selectedCell?.widgetName
    ])

    const resultColumns = React.useMemo(() => {
        const controlColumnsLeft: Array<ColumnProps<DataItem>> = []
        const controlColumnsRight: Array<ColumnProps<DataItem>> = []
        props.controlColumns?.map(item => {
            item.position === 'left'
                ? controlColumnsLeft.push(item.column)
                : controlColumnsRight.push(item.column)
        })
        return [...controlColumnsLeft, ...columns, ...controlColumnsRight]
    }, [columns, props.controlColumns])

    const [filterGroupName, setFilterGroupName] = React.useState(null)
    const filtersExist = !!props.filters?.length

    const handleShowAll = () => {
        props.onShowAll(props.meta.bcName, props.cursor, null, props.widgetName)
    }

    const handleRemoveFilters = () => {
        props.onRemoveFilters(props.meta.bcName)
        props.onForceUpdate(props.meta.bcName)
    }

    const handleAddFilters = React.useMemo(
        () => {
            return (value: string) => {
                const filterGroup = props.filterGroups.find(item => item.name === value)
                const parsedFilters = parseFilters(filterGroup.filters)
                setFilterGroupName(filterGroup.name)
                props.onRemoveFilters(props.meta.bcName)
                parsedFilters.forEach(item => props.onApplyFilter(props.meta.bcName, item))
                props.onForceUpdate(props.meta.bcName)
            }
        },
        [props.filterGroups, props.meta.bcName]
    )

    React.useEffect(
        () => {
            if (!filtersExist) {
                setFilterGroupName(null)
            }
        },
        [filtersExist]
    )

    return <div
        className={styles.tableContainer}
        ref={tableContainerRef}
    >
        <div
            className={styles.filtersContainer}
        >
            {!!props.filterGroups?.length &&
                <Select
                    value={filterGroupName ? filterGroupName : t('Show all').toString()}
                    onChange={handleAddFilters}
                    dropdownMatchSelectWidth={false}
                >
                    {props.filterGroups.map((group) =>
                        <Select.Option
                            key={group.name}
                            value={group.name}
                        >
                            <span>{group.name}</span>
                        </Select.Option>
                    )}
                </Select>
            }
            {filtersExist &&
                <ActionLink onClick={handleRemoveFilters}> {t('Clear all filters')} </ActionLink>
            }
            {props.limitBySelf &&
                <ActionLink onClick={handleShowAll}> {t('Show all records')} </ActionLink>
            }
        </div>
        <Table
            className={cn(
                styles.table,
                {[styles.tableWithRowMenu]: props.showRowActions}
            )}
            columns={resultColumns}
            dataSource={props.data}
            rowKey="id"
            rowSelection={props.rowSelection}
            pagination={false}
            onRow={(props.showRowActions) ? onTableRow : null}
            {...rest}
        />
        {!props.disablePagination && <Pagination bcName={props.meta.bcName} mode={props.paginationMode
        || PaginationMode.page} widgetName={props.meta.name}/>}
        {(props.showRowActions) && !props.disableDots &&
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
    const fields = bcUrl && store.view.rowMeta[bcName]?.[bcUrl]?.fields
    const bc = store.screen.bo.bc[bcName]
    const cursor = bc?.cursor
    const hasNext = bc?.hasNext
    const limitBySelf = cursor && store.router.bcPath?.includes(`${bcName}/${cursor}`)
    const operations = store.view.rowMeta[bcName]?.[bcUrl]?.actions
    const filters = store.screen.filters[bcName]
    return {
        data: store.data[ownProps.meta.bcName],
        rowMetaFields: fields,
        limitBySelf,
        bcName,
        /**
         * @deprecated
         */
        route: null as Route,
        cursor,
        hasNext,
        selectedCell: store.view.selectedCell,
        /**
         * @deprecated
         */
        pendingDataItem: null as PendingDataItem,
        operations,
        metaInProgress: !!store.view.metaInProgress[bcName],
        filters,
        filterGroups: bc?.filterGroups
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onSelectCell: (cursor: string, widgetName: string, fieldKey: string) => {
            dispatch($do.selectTableCellInit({ widgetName, rowId: cursor, fieldKey }))
        },
        onShowAll: (bcName: string, cursor: string, route?: Route) => {
            dispatch($do.showAllTableRecordsInit({ bcName, cursor }))
        },
        /**
         * @deprecated TODO: Remove in 2.0
         */
        onDrillDown: null as (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void,
        onOperationClick: (bcName: string, operationType: string, widgetName: string) => {
            dispatch($do.sendOperation({ bcName, operationType, widgetName }))
        },
        onSelectRow: (bcName: string, cursor: string) => {
            dispatch($do.bcSelectRecord({ bcName, cursor }))
        },
        onRemoveFilters: (bcName: string) => {
            dispatch($do.bcRemoveAllFilters({ bcName}))
        },
        onApplyFilter: (bcName: string, filter: BcFilter) => {
            dispatch($do.bcAddFilter({ bcName, filter }))
        },
        onForceUpdate: (bcName: string) => {
            dispatch($do.bcForceUpdate({ bcName }))
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TableWidget)
