import React, { FunctionComponent } from 'react'
import { Table, Icon, Menu, Skeleton, Dropdown } from 'antd'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { $do } from '../../actions/actions'
import { Store } from '../../interfaces/store'
import Field from '../../components/Field/Field'
import { buildBcUrl } from '../../utils/strings'
import { WidgetTableMeta, WidgetListField, WidgetTableHierarchy } from '../../interfaces/widget'
import { DataItem, PendingDataItem } from '../../interfaces/data'
import { RowMetaField } from '../../interfaces/rowMeta'
import { ColumnProps, TableRowSelection, TableEventListeners } from 'antd/lib/table'
import { Route } from '../../interfaces/router'
import { FieldType } from '../../interfaces/view'
import styles from './HierarchyTable.less'
import { AssociatedItem, Operation, OperationGroup } from '../../interfaces/operation'
import { useAssocRecords } from '../../hooks/useAssocRecords'
import Pagination from '../ui/Pagination/Pagination'
import { PaginationMode } from '../../interfaces/widget'
import cn from 'classnames'
import { getColumnWidth } from '../../utils/hierarchy'
import { useWidgetOperations } from '../../hooks'
import { useTranslation } from 'react-i18next'

interface HierarchyTableOwnProps {
    meta: WidgetTableMeta
    assocValueKey?: string
    nestedByBc?: string
    parentBcName?: string
    showPagination?: boolean
    oneFloatMenuIsOpened?: React.MutableRefObject<boolean>
    floatMenuRefReverseList?: Array<React.MutableRefObject<HTMLDivElement>>
    mouseAboveTableReverseList?: Array<React.MutableRefObject<boolean>>
    floatMenuClosed?: number
    onRow?: (record: DataItem, index: number) => TableEventListeners
}

export interface HierarchyTableProps extends HierarchyTableOwnProps {
    childData: AssociatedItem[]
    hierarchyLevels: WidgetTableHierarchy[]
    nestedBcName: string
    widgetName?: string
    indentLevel: number
    data: AssociatedItem[]
    rowMetaFields: RowMetaField[]
    cursor: string
    parentCursor: string
    route: Route
    loading: boolean
    selectable?: boolean
    pendingChanges: Record<string, PendingDataItem>
    operations?: Array<Operation | OperationGroup>
    metaInProgress: boolean
    onDeselectAll?: (bcNames: string[]) => void
    onSelect?: (bcName: string, dataItem: AssociatedItem, widgetName: string, assocValueKey: string) => void
    onSelectAll?: (bcName: string, assocValueKey: string, selected: boolean) => void
    onDrillDown?: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
    onExpand: (bcName: string, nestedBcName: string, cursor: string, route: Route) => void
    onOperationClick: (bcName: string, operationType: string, widgetName: string) => void
}

export const Exp: FunctionComponent = (props: any) => {
    if (!props.onExpand || props.record.noChildren) {
        return null
    }
    const type = props.expanded ? 'minus-square' : 'plus-square'
    return <Icon className={styles.expand} type={type} onClick={e => props.onExpand(props.record, e)} />
}

const emptyArray: string[] = []
const emptyData: AssociatedItem[] = []

/**
 *
 * @param props
 * @category Components
 */
export const HierarchyTable: FunctionComponent<HierarchyTableProps> = props => {
    const { t } = useTranslation()

    const bcName = props.nestedByBc || props.meta.bcName

    const { hierarchyGroupSelection, hierarchyRadio, hierarchyRadioAll, hierarchyDisableRoot } = props.meta.options ?? {}

    // TODO: Simplify all this
    const { hierarchyLevels, nestedBcName, indentLevel } = props
    const hierarchyLevel = props.nestedByBc ? hierarchyLevels.find(item => item.bcName === props.nestedByBc) : null
    const nestedHierarchyDescriptor = hierarchyLevel
        ? hierarchyLevels[hierarchyLevels.findIndex(item => item === hierarchyLevel) + 1]
        : hierarchyLevels[0]
    const hasNested = indentLevel < hierarchyLevels.length

    const isRadio = hierarchyLevel?.radio || (!hierarchyLevel && hierarchyRadio)
    const selectedRecords = useAssocRecords(props.data, props.pendingChanges, isRadio)

    // Refs for row operations popup
    const floatMenuRef = React.useRef(null)
    const mouseAboveTableRef = React.useRef(false)
    const [floatMenuClosed, setFloatMenuClosed] = React.useState(0)
    let oneFloatMenuIsOpenedRef = React.useRef(false)
    oneFloatMenuIsOpenedRef = indentLevel === 0 ? oneFloatMenuIsOpenedRef : props.oneFloatMenuIsOpened

    const rowSelection: TableRowSelection<DataItem> = React.useMemo(() => {
        if (props.selectable && !(indentLevel === 0 && hierarchyDisableRoot)) {
            return {
                type: 'checkbox',
                selectedRowKeys: selectedRecords.map(item => item.id),
                onSelect: (record: AssociatedItem, selected: boolean) => {
                    const dataItem = {
                        ...record,
                        _associate: selected,
                        _value: hierarchyLevel ? record[hierarchyLevel.assocValueKey] : record[props.assocValueKey]
                    }

                    const isRadioAll = hierarchyRadioAll
                    if (selected && !isRadioAll) {
                        if (isRadio && selectedRecords.length) {
                            const prevSelected = selectedRecords[0]
                            props.onSelect(bcName, { ...prevSelected, _associate: false }, props.meta.name, props.assocValueKey)
                        }

                        const radioAncestorAndSameBcName: string[] = []
                        ;[props.meta.bcName, ...hierarchyLevels.map(item => item.bcName)].some(feBcName => {
                            if (
                                (feBcName === props.meta.bcName && hierarchyRadio) ||
                                (feBcName !== props.meta.bcName && hierarchyLevels.find(v => v.bcName === feBcName).radio)
                            ) {
                                radioAncestorAndSameBcName.push(feBcName)
                            }

                            return feBcName === bcName
                        })

                        if (radioAncestorAndSameBcName.length) {
                            props.onDeselectAll(radioAncestorAndSameBcName)
                        }
                    }

                    if (isRadioAll) {
                        props.onDeselectAll([props.meta.bcName, ...hierarchyLevels.map(item => item.bcName)])
                    }
                    if (nestedHierarchyDescriptor && props.cursor === record.id && hierarchyGroupSelection) {
                        props.onSelectAll(nestedHierarchyDescriptor.bcName, nestedHierarchyDescriptor.assocValueKey, selected)
                    }
                    props.onSelect(bcName, dataItem, props.meta.name, props.assocValueKey)
                }
            }
        }
        return undefined
    }, [bcName, props.onSelect, props.cursor, selectedRecords, props.assocValueKey])

    const [currentCursor, setCurrentCursor] = React.useState(undefined)
    const [noChildRecords, setNoChildRecords] = React.useState([])
    const tableRecords = React.useMemo(() => {
        return props.data?.map(item => {
            return {
                ...item,
                noChildren: noChildRecords.includes(item.id)
            }
        })
    }, [currentCursor, props.data, noChildRecords])
    const [userClosedRecords, setUserClosedRecords] = React.useState([])
    const expandedRowKeys = React.useMemo(() => {
        if (currentCursor && !props.childData?.length) {
            if (!noChildRecords.includes(currentCursor)) {
                setNoChildRecords([...noChildRecords, currentCursor])
            }
            return emptyArray
        }
        if (noChildRecords.includes(currentCursor)) {
            setNoChildRecords(noChildRecords.filter(item => item !== currentCursor))
        }
        return !currentCursor || userClosedRecords.includes(currentCursor) ? emptyArray : [currentCursor]
    }, [currentCursor, userClosedRecords, props.childData])

    const handleExpand = (expanded: boolean, dataItem: DataItem) => {
        if (expanded) {
            setCurrentCursor(dataItem.id)
            setUserClosedRecords(userClosedRecords.filter(item => item !== dataItem.id))

            if (floatMenuRef.current) {
                // menu stays on one place when we click expand and move mouse out of table, there is no any event fired
                floatMenuRef.current.classList.remove(styles.showMenu)
            }

            props.onExpand(props.nestedByBc || props.meta.bcName, nestedBcName, dataItem.id, props.route)
        } else {
            setUserClosedRecords([...userClosedRecords, dataItem.id])
        }
    }

    const resetCursor = React.useCallback(() => {
        setCurrentCursor(null)
    }, [])

    const floatMenuRefReverseList = React.useMemo(() => {
        return [floatMenuRef, ...(props.floatMenuRefReverseList ? props.floatMenuRefReverseList : [])]
    }, [props.floatMenuRefReverseList])

    const mouseAboveTableReverseList = React.useMemo(() => {
        return [mouseAboveTableRef, ...(props.mouseAboveTableReverseList ? props.mouseAboveTableReverseList : [])]
    }, [props.mouseAboveTableReverseList])

    // Expanded nodes rendered as nested table component
    const nested = (record: DataItem, index: number, indent: number, expanded: boolean) => {
        if (record.id !== props.cursor) {
            return null
        }
        return (
            <ConnectedHierarchyTable
                meta={props.meta}
                selectable={props.selectable}
                parentBcName={props.nestedByBc || props.meta.bcName}
                assocValueKey={nestedHierarchyDescriptor.assocValueKey}
                nestedByBc={nestedBcName}
                floatMenuRefReverseList={floatMenuRefReverseList}
                mouseAboveTableReverseList={mouseAboveTableReverseList}
                oneFloatMenuIsOpened={oneFloatMenuIsOpenedRef}
                floatMenuClosed={floatMenuClosed}
                onDrillDown={null}
                onRow={props.onRow}
            />
        )
    }
    const isSameBcHierarchy = props.meta.options?.hierarchySameBc
    const fields = hierarchyLevel ? hierarchyLevel.fields : props.meta.fields
    const withHierarchyShift = fields.some(field => field.hierarchyShift === true)

    /**
     * Hierarchies builded around the same business component rely on identical set of fields for each
     * level of hierarchy, so the levels are indented by empty cell for field that belongs to top level.
     *
     * Regular hierarchies use pseudo-column for indentation
     */
    const indentColumn = !isSameBcHierarchy
        ? [
              {
                  title: '',
                  key: '_indentColumn',
                  dataIndex: null as string,
                  className: styles.selectColumn,
                  width: withHierarchyShift ? `${50 + indentLevel * 20}px` : '50px',
                  render: (): React.ReactNode => null
              }
          ]
        : []

    const fieldCustomProps = React.useMemo(() => {
        return { hierarchyDepth: indentLevel + 1 }
    }, [indentLevel])

    const processedFields: WidgetListField[] = React.useMemo(
        () =>
            fields.map(item => {
                return item.type === FieldType.multivalue ? { ...item, type: FieldType.multivalueHover } : item
            }),
        [fields]
    )

    const columns: Array<ColumnProps<DataItem>> = React.useMemo(() => {
        return [
            ...indentColumn,
            ...processedFields
                .filter(item => !item.hidden && item.type !== FieldType.hidden)
                .map((item, index) => {
                    const itemWidth = isSameBcHierarchy
                        ? getColumnWidth(item.key, indentLevel, processedFields, props.rowMetaFields, hierarchyLevels.length, item.width)
                        : item.width
                    const className = isSameBcHierarchy
                        ? styles.sameHierarchyNode
                        : cn({ [styles[`padding${indentLevel}`]]: processedFields[0].key === item.key && indentLevel && !item.width })
                    return {
                        title: item.title,
                        key: item.key,
                        dataIndex: item.key,
                        width: itemWidth,
                        className,
                        render: (text: string, dataItem: any) => {
                            const node: React.ReactNode = (
                                <Field
                                    bcName={bcName}
                                    cursor={dataItem.id}
                                    widgetName={props.meta.name}
                                    widgetFieldMeta={item}
                                    readonly
                                    customProps={fieldCustomProps}
                                />
                            )
                            return hasNested && index === 0 ? <span className={styles.expandPadding}>{node}</span> : node
                        }
                    }
                })
        ]
    }, [indentLevel, processedFields, props.rowMetaFields, hasNested])

    // =================
    // ---- Actions ----

    // Refs for row operations popup
    const tableContainerRef = React.useRef(null)
    const tableBodyRef = React.useRef(null)
    const floatMenuIsOpenedRef = React.useRef(false)
    const mouseAboveRowRef = React.useRef(false)
    const floatMenuHoveredRecordRef = React.useRef('')
    const expectedFloatMenuTopValueRef = React.useRef('') // menu position after closing
    const anyTrRef = React.useRef(null)
    const targetTrRef = React.useRef(null)
    const floatMenuMouseAboveRef = React.useRef(false)
    const hierarchyShowRowActions = props.meta.options?.actionGroups

    const onRowMouseEnterHandler = React.useCallback(
        (target: HTMLElement, recordId: string) => {
            // if we move mouse too fast and it gets on float menu position, we get wrong menu position, wrong recordId and
            // with "-extra-row" at the end
            if (isNaN(Number(recordId))) {
                return
            }

            mouseAboveRowRef.current = true
            anyTrRef.current = target

            if ((hierarchyShowRowActions && !floatMenuRef.current) || !tableContainerRef.current || floatMenuIsOpenedRef.current) {
                return
            }

            const tableContainerRect = tableContainerRef.current.getBoundingClientRect()
            const tableRowRect = target.getBoundingClientRect()

            const floatMenuTopValue = `${tableRowRect.top - tableContainerRect.top + 15}px`
            floatMenuHoveredRecordRef.current = recordId

            if (
                hierarchyShowRowActions &&
                props.data?.length === 1 &&
                floatMenuRef.current &&
                floatMenuTopValue === floatMenuRef.current.style.top
            ) {
                return
            }

            expectedFloatMenuTopValueRef.current = floatMenuTopValue

            if (!floatMenuIsOpenedRef.current && floatMenuRef.current) {
                floatMenuRef.current.style.top = floatMenuTopValue
                if (!oneFloatMenuIsOpenedRef.current) {
                    floatMenuRef.current.classList.add(styles.showMenu)
                }
            }
        },
        [hierarchyShowRowActions, props.data]
    )

    const onTableMouseEnter = React.useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            mouseAboveTableRef.current = true

            if (!oneFloatMenuIsOpenedRef.current && floatMenuRef.current) {
                floatMenuRef.current.classList.add(styles.showMenu)
                if (props.floatMenuRefReverseList && props.mouseAboveTableReverseList) {
                    props.floatMenuRefReverseList.some((item, index) => {
                        if (props.mouseAboveTableReverseList[index].current) {
                            item.current.classList.remove(styles.showMenu)
                            return true
                        }
                        return false
                    })
                }
            }

            /*
             * workaround: Table.onRow.onMouseEnter event isn't fired on chrome after menu disappear, when we select record menu item, that
             * located above another record.
             * https://github.com/facebook/react/issues/16566
             */
            if (!oneFloatMenuIsOpenedRef.current && !floatMenuIsOpenedRef.current && tableBodyRef.current) {
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
        [props.floatMenuRefReverseList, props.mouseAboveTableReverseList]
    )

    const onTableMouseLeave = React.useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            mouseAboveTableRef.current = false

            if (!oneFloatMenuIsOpenedRef.current && !floatMenuIsOpenedRef.current && floatMenuRef.current) {
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
                if (props.floatMenuRefReverseList && props.mouseAboveTableReverseList) {
                    props.floatMenuRefReverseList.some((item, index) => {
                        if (props.mouseAboveTableReverseList[index].current) {
                            item.current.classList.add(styles.showMenu)
                            return true
                        }
                        return false
                    })
                }
            }
        },
        [props.floatMenuRefReverseList, props.mouseAboveTableReverseList]
    )

    const onFloatMenuMouseEnter = React.useCallback((event: any) => {
        floatMenuMouseAboveRef.current = true
    }, [])

    const onFloatMenuMouseLeave = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
        floatMenuMouseAboveRef.current = false
        if (!oneFloatMenuIsOpenedRef.current && !floatMenuIsOpenedRef.current && tableBodyRef.current) {
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
    }, [])

    React.useEffect(() => {
        if (hierarchyShowRowActions && tableContainerRef.current) {
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
    }, [hierarchyShowRowActions])

    const onTableRowFull = React.useCallback(
        (record, index) => ({
            ...props.onRow,
            ...(hierarchyShowRowActions
                ? {
                      onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
                          onRowMouseEnterHandler(event.currentTarget, record.id)
                      },
                      onMouseLeave: () => {
                          mouseAboveRowRef.current = false
                      }
                  }
                : {})
        }),
        [props.onRow, hierarchyShowRowActions, onRowMouseEnterHandler]
    )

    const onTableRow = React.useCallback(
        (record, index) => {
            return hierarchyShowRowActions
                ? {
                      onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
                          onRowMouseEnterHandler(event.currentTarget, record.id)
                      },
                      onMouseLeave: () => {
                          mouseAboveRowRef.current = false
                      }
                  }
                : null
        },
        [hierarchyShowRowActions, onRowMouseEnterHandler]
    )

    const onMenuVisibilityChange = React.useCallback(
        (visibility: boolean) => {
            floatMenuIsOpenedRef.current = visibility
            oneFloatMenuIsOpenedRef.current = visibility
            if (visibility) {
                if (floatMenuHoveredRecordRef?.current !== props.cursor) {
                    targetTrRef.current = anyTrRef.current
                    if (nestedBcName) {
                        setCurrentCursor(floatMenuHoveredRecordRef.current)
                        setUserClosedRecords(userClosedRecords.filter(item => item !== floatMenuHoveredRecordRef.current))
                    }
                    props.onExpand(bcName, nestedBcName, floatMenuHoveredRecordRef.current, props.route)
                }
            } else {
                setFloatMenuClosed(prev => prev + 1)
                if (!mouseAboveRowRef.current && floatMenuRef.current) {
                    if (!floatMenuMouseAboveRef.current) {
                        floatMenuRef.current.classList.remove(styles.showMenu)
                        if (props.floatMenuRefReverseList && props.mouseAboveTableReverseList) {
                            props.floatMenuRefReverseList.some((item, index) => {
                                if (props.mouseAboveTableReverseList[index].current) {
                                    item.current.classList.add(styles.showMenu)
                                    return true
                                }
                                return false
                            })
                        }
                    }
                } else if (expectedFloatMenuTopValueRef.current && floatMenuRef.current) {
                    floatMenuRef.current.style.top = expectedFloatMenuTopValueRef.current
                }

                if (mouseAboveRowRef.current) {
                    onRowMouseEnterHandler(anyTrRef.current, anyTrRef.current.getAttribute('data-row-key'))
                }
            }
        },
        [
            props.cursor,
            props.meta.bcName,
            props.meta.name,
            nestedBcName,
            bcName,
            indentLevel,
            props.onExpand,
            userClosedRecords,
            props.floatMenuRefReverseList,
            props.mouseAboveTableReverseList
        ]
    )

    const operationList = useWidgetOperations(props.operations, props.meta, bcName)

    const rowActionsMenu = React.useMemo(() => {
        const menuItemList: React.ReactNode[] = []
        operationList.forEach((item: Operation | OperationGroup, index) => {
            if ((item as OperationGroup).actions) {
                const groupOperations: React.ReactNode[] = []
                ;(item as OperationGroup).actions.forEach(operation => {
                    if (operation.scope === 'record') {
                        groupOperations.push(
                            <Menu.Item
                                key={operation.type}
                                onClick={() => {
                                    onMenuVisibilityChange(false) // Dropdown bug: doesn't call onVisibleChange on menu item click
                                    props.onOperationClick(bcName, operation.type, props.meta.name)
                                }}
                            >
                                {operation.icon && <Icon type={operation.icon} className={styles.icon} />}
                                {operation.text}
                            </Menu.Item>
                        )
                    }
                })
                if (groupOperations.length) {
                    menuItemList.push(
                        <Menu.ItemGroup key={item.type || item.text} title={item.text}>
                            {groupOperations.map(v => v)}
                        </Menu.ItemGroup>
                    )
                }
            }

            const ungroupedOperation = item as Operation
            if (ungroupedOperation.scope === 'record') {
                menuItemList.push(
                    <Menu.Item
                        key={item.type}
                        onClick={() => {
                            onMenuVisibilityChange(false) // Dropdown bug: doesn't call onVisibleChange on menu item click
                            props.onOperationClick(bcName, ungroupedOperation.type, props.meta.name)
                        }}
                    >
                        {ungroupedOperation.icon && <Icon type={ungroupedOperation.icon} className={styles.icon} />}
                        {item.text}
                    </Menu.Item>
                )
            }
        })

        return (
            <Menu>
                {props.metaInProgress ? (
                    <Menu.Item disabled>
                        <div className={styles.floatMenuSkeletonWrapper}>
                            <Skeleton active />
                        </div>
                    </Menu.Item>
                ) : menuItemList.length ? (
                    menuItemList.map(item => {
                        return item
                    })
                ) : (
                    <Menu.Item disabled>{t('No operations available')}</Menu.Item>
                )}
            </Menu>
        )
    }, [operationList, props.meta.name, props.onOperationClick, bcName, props.metaInProgress, indentLevel])

    // returns menu visibility on sublevel if should, when we close above level menu
    React.useEffect(() => {
        setFloatMenuClosed(prev => prev + 1)
        if (mouseAboveRowRef.current && floatMenuRef.current) {
            floatMenuRef.current.classList.add(styles.showMenu)
        }
    }, [props.floatMenuClosed])

    // keep menu on one place when sublevel is loading
    if (floatMenuIsOpenedRef.current && targetTrRef.current) {
        const tableContainerRect = tableContainerRef.current.getBoundingClientRect()
        const tableRowRect = targetTrRef.current.getBoundingClientRect()
        const floatMenuTopValue = `${tableRowRect.top - tableContainerRect.top + 15}px`

        expectedFloatMenuTopValueRef.current = floatMenuTopValue
        floatMenuRef.current.style.top = floatMenuTopValue
        floatMenuHoveredRecordRef.current = targetTrRef.current.getAttribute('data-row-key')
    }
    // ---- END: Actions ----
    // ======================

    return (
        <div className={styles.container} ref={tableContainerRef}>
            <Table
                className={styles.table}
                rowSelection={rowSelection}
                rowKey="id"
                columns={columns}
                pagination={false}
                showHeader={!props.nestedByBc}
                expandIcon={hasNested ? (Exp as any) : undefined}
                defaultExpandedRowKeys={[props.cursor]}
                expandedRowKeys={expandedRowKeys}
                onExpand={hasNested ? handleExpand : undefined}
                dataSource={tableRecords}
                expandedRowRender={hasNested ? nested : undefined}
                expandIconAsCell={false}
                expandIconColumnIndex={rowSelection ? 1 : 0}
                loading={props.loading}
                onRow={(!(hierarchyDisableRoot && indentLevel === 0) && onTableRowFull) || onTableRow}
            />
            {props.showPagination && (
                <Pagination bcName={bcName} mode={PaginationMode.page} onChangePage={resetCursor} widgetName={props.meta.name} />
            )}
            {hierarchyShowRowActions && (
                <div
                    ref={floatMenuRef}
                    className={styles.floatMenu}
                    onMouseEnter={onFloatMenuMouseEnter}
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
            )}
        </div>
    )
}

function mapStateToProps(store: Store, ownProps: HierarchyTableOwnProps) {
    const bcMap = store.screen.bo.bc
    const bcName = ownProps.nestedByBc || ownProps.meta.bcName
    const hierarchyLevels = ownProps.meta.options?.hierarchy
    const indentLevel = ownProps.nestedByBc ? hierarchyLevels.findIndex(item => item.bcName === ownProps.nestedByBc) + 1 : 0
    const nestedBcName = hierarchyLevels[indentLevel]?.bcName
    const loading = bcMap[bcName]?.loading
    const bcUrl = buildBcUrl(bcName, true)
    const fields = bcUrl && store.view.rowMeta[bcName]?.[bcUrl]?.fields
    const cursor = bcMap[bcName]?.cursor
    const parentCursor = ownProps.nestedByBc && bcMap[ownProps.parentBcName]?.cursor
    const pendingChanges = store.view.pendingDataChanges[bcName]
    return {
        childData: loading ? emptyData : store.data[nestedBcName],
        indentLevel,
        nestedBcName,
        hierarchyLevels,
        data: loading ? emptyData : store.data[bcName],
        pendingChanges,
        rowMetaFields: fields,
        cursor,
        parentCursor,
        route: store.router,
        loading,
        metaInProgress: !!store.view.metaInProgress[bcName],
        operations: store.view.rowMeta[bcName]?.[bcUrl]?.actions
    }
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: HierarchyTableOwnProps) {
    return {
        onExpand: (bcName: string, nestedBcName: string, cursor: string, route: Route) => {
            dispatch($do.bcSelectRecord({ bcName, cursor, ignoreChildrenPageLimit: true, keepDelta: true }))
        },
        onSelect: (bcName: string, dataItem: AssociatedItem, widgetName: string, assocValueKey: string) => {
            dispatch($do.changeAssociation({ bcName, widgetName, dataItem, assocValueKey }))
        },
        onDeselectAll: (bcNames: string[]) => {
            dispatch($do.dropAllAssociations({ bcNames }))
        },
        onSelectAll: (bcName: string, assocValueKey: string, selected: boolean) => {
            dispatch($do.changeChildrenAssociations({ bcName, assocValueKey, selected }))
        },
        onOperationClick: (bcName: string, operationType: string, widgetName: string) => {
            dispatch($do.sendOperation({ bcName, operationType, widgetName }))
        }
    }
}

const ConnectedHierarchyTable = connect(mapStateToProps, mapDispatchToProps)(HierarchyTable)
/**
 * @category Components
 */
export default ConnectedHierarchyTable
