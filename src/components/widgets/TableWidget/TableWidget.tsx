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
import {BcFilter, FilterGroup} from '../../../interfaces/filters'
import {useTranslation} from 'react-i18next'
import FullHierarchyTable from '../../../components/FullHierarchyTable/FullHierarchyTable'
import {parseFilters} from '../../../utils/filters'
import Select from '../../ui/Select/Select'

interface TableWidgetOwnProps {
    meta: WidgetTableMeta,
    rowSelection?: TableRowSelection<DataItem>,
    showRowActions?: boolean,
    allowEdit?: boolean,
    paginationMode?: PaginationMode,
    disablePagination?: boolean,
    showDots?: boolean
}

export interface TableWidgetProps extends TableWidgetOwnProps {
    data: DataItem[],
    rowMetaFields: RowMetaField[],
    limitBySelf: boolean,
    bcName: string,
    widgetName?: string,
    route: Route,
    cursor: string,
    selectedCell: ViewSelectedCell,
    pendingDataItem: PendingDataItem,
    hasNext: boolean,
    operations: Array<Operation | OperationGroup>,
    metaInProgress: boolean,
    filters: BcFilter[],
    filterGroups: FilterGroup[],
    onDrillDown: (widgetName: string, bcName: string, cursor: string, fieldKey: string) => void,
    onShowAll: (bcName: string, cursor: string, route: Route, widgetName: string) => void,
    onOperationClick: (bcName: string, operationType: string, widgetName: string) => void,
    onSelectRow: (bcName: string, cursor: string) => void,
    onSelectCell: (cursor: string, widgetName: string, fieldKey: string) => void,
    onRemoveFilters: (bcName: string) => void,
    onApplyFilter: (bcName: string, filter: BcFilter) => void,
    onForceUpdate: (bcName: string) => void
}

export const TableWidget: FunctionComponent<TableWidgetProps> = (props) => {
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
    const allowEdit = (props.allowEdit ?? true) && !props.meta.options?.readOnly
    const {t} = useTranslation()

    // Набор рефов для работы меню операций строки
    const floatMenuRef = React.useRef(null)
    const tableContainerRef = React.useRef(null)
    const tableBodyRef = React.useRef(null)
    const floatMenuHoveredRecord = React.useRef('')
    const floatMenuIsOpened = React.useRef(false)
    const mouseAboveRow = React.useRef(false)
    const expectedFloatMenuTopValue = React.useRef('') // положение меню, которое должно быть выставлено после закрытия

    const onRowMouseEnterHandler = React.useCallback(
        (target: HTMLElement, recordId: string) => {
            mouseAboveRow.current = true

            // Should compare hovered record id with event target id, because function is called twice, when cursor enters table
            if ((props.showDots ? false : !floatMenuRef.current)
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
                    props.onSelectRow(props.bcName, floatMenuHoveredRecord.current)
                }
            } else {
                if (!mouseAboveRow.current && floatMenuRef.current) {
                    floatMenuRef.current.classList.remove(styles.showMenu)
                } else if (expectedFloatMenuTopValue.current && floatMenuRef.current) {
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
                                        onMenuVisibilityChange(false) // Dropdown bug: doesn't call onVisibleChange on menu item click
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
                                onMenuVisibilityChange(false) // Dropdown bug: doesn't call onVisibleChange on menu item click
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
                            {t('No operations available')}
                        </Menu.Item>
                }
            </Menu>
        },
        [operations, props.meta.name, props.onOperationClick, props.bcName, props.metaInProgress]
    )

    const processCellClick = (recordId: string, fieldKey: string) => {
        props.onSelectCell(recordId, props.meta.name, fieldKey)
    }

    const dotsColumn = {
        title: '',
        key: '_dotsColumn',
        dataIndex: null as string,
        width: '50px',
        render: (text: string, dataItem: any): React.ReactNode => {
            return <div className={styles.showDotsMenu}>
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
    }

    const columns: Array<ColumnProps<DataItem>> = React.useMemo(() => {
        const fields = props.meta.fields
            .filter((item: WidgetListField) => item.type !== FieldType.hidden && !item.hidden)
            .map((item: WidgetListField) => {
                const fieldRowMeta = props.rowMetaFields?.find(field => field.key === item.key)
                return {
                    title: <ColumnTitle
                        widgetName={props.meta.name}
                        widgetMeta={item}
                        rowMeta={fieldRowMeta}
                    />,
                    key: item.key,
                    dataIndex: item.key,
                    width: item.width,
                    render: (text: string, dataItem:any) => {
                        if (item.type === FieldType.multivalue) {
                            return <MultivalueHover
                                data={(dataItem[item.key] || emptyMultivalue) as MultivalueSingleValue[]}
                                displayedValue={item.displayedKey && dataItem[item.displayedKey]}
                            />
                        }

                        const editMode = allowEdit && (props.selectedCell && item.key === props.selectedCell.fieldKey
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
                        return (!allowEdit)
                            ? null
                            : {
                                onDoubleClick: (event: React.MouseEvent) => {
                                    processCellClick(record.id, item.key)
                                }
                            }
                    }
                }
            })
        return props.showDots ? [ ...fields, dotsColumn] : fields
    }, [dotsColumn, props.meta.fields])

    const [filterGroupName, setFilterGroupName] = React.useState(null)
    const filtersExist = !!props.filters?.length

    const handleShowAll = () => {
        props.onShowAll(props.bcName, props.cursor, props.route, props.widgetName)
    }

    const handleRemoveFilters = () => {
        props.onRemoveFilters(props.bcName)
        props.onForceUpdate(props.bcName)
    }

    const handleAddFilters = React.useMemo(
        () => {
            return (value: string) => {
                const filterGroup = props.filterGroups.find(item => item.name === value)
                const parsedFilters = parseFilters(filterGroup.filters)
                setFilterGroupName(filterGroup.name)
                props.onRemoveFilters(props.bcName)
                parsedFilters.forEach(item => props.onApplyFilter(props.bcName, item))
                props.onForceUpdate(props.bcName)
            }
        },
        [props.filterGroups, props.bcName]
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
            columns={columns}
            dataSource={props.data}
            rowKey="id"
            rowSelection={props.rowSelection}
            pagination={false}
            onRow={(props.showRowActions) ? onTableRow : null}
        />
        {!props.disablePagination && <Pagination bcName={props.bcName} mode={props.paginationMode
        || PaginationMode.page} widgetName={props.meta.name}/>}
        {(props.showRowActions) && !props.showDots &&
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
        route: store.router,
        cursor,
        hasNext,
        selectedCell: store.view.selectedCell,
        pendingDataItem: cursor && store.view.pendingDataChanges[bcName]?.[cursor],
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
