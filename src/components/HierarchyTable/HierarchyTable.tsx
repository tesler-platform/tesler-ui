import React, { FunctionComponent } from 'react'
import { Table, Icon } from 'antd'
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
import { AssociatedItem } from '../../interfaces/operation'
import { useAssocRecords } from '../../hooks/useAssocRecords'
import Pagination from '../ui/Pagination/Pagination'
import { PaginationMode } from '../../interfaces/widget'
import cn from 'classnames'
import { getColumnWidth } from '../../utils/hierarchy'
import RowOperationsButton from '../RowOperations/RowOperationsButton'
import { useRowMenu } from '../../hooks/useRowMenu'

interface HierarchyTableOwnProps {
    meta: WidgetTableMeta
    assocValueKey?: string
    nestedByBc?: string
    parentBcName?: string
    showPagination?: boolean
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
    onDeselectAll?: (bcNames: string[]) => void
    onSelect?: (bcName: string, dataItem: AssociatedItem, widgetName: string, assocValueKey: string) => void
    onSelectAll?: (bcName: string, assocValueKey: string, selected: boolean) => void
    onDrillDown?: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
    onExpand: (bcName: string, nestedBcName: string, cursor: string, route: Route) => void
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
export const HierarchyTable: FunctionComponent<HierarchyTableProps> = ({ onRow, ...props }) => {
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
            props.onExpand(props.nestedByBc || props.meta.bcName, nestedBcName, dataItem.id, props.route)
        } else {
            setUserClosedRecords([...userClosedRecords, dataItem.id])
        }
    }

    const resetCursor = React.useCallback(() => {
        setCurrentCursor(null)
    }, [])

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
                onDrillDown={null}
                onRow={onRow}
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
    const showOperations = props.meta.options?.actionGroups
    const [operationsRef, tableRef, onHover] = useRowMenu()
    const handleRow = React.useCallback(
        (record: DataItem, index: number) => {
            const basicHandlers = !(hierarchyDisableRoot && !indentLevel) && onRow?.(record, index)
            const hoverHandlers = showOperations && onHover?.(record)
            return { ...basicHandlers, ...hoverHandlers }
        },
        [onHover, showOperations, hierarchyDisableRoot, indentLevel, onRow]
    )

    return (
        <div className={styles.container} ref={tableRef}>
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
                onRow={handleRow}
            />
            {props.showPagination && (
                <Pagination bcName={bcName} mode={PaginationMode.page} onChangePage={resetCursor} widgetName={props.meta.name} />
            )}
            {showOperations && <RowOperationsButton meta={props.meta} bcName={bcName} parent={tableRef} ref={operationsRef} />}
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
        loading
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
        }
    }
}

const ConnectedHierarchyTable = connect(mapStateToProps, mapDispatchToProps)(HierarchyTable)
/**
 * @category Components
 */
export default ConnectedHierarchyTable
