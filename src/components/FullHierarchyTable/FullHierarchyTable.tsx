import React, {FunctionComponent} from 'react'
import styles from './FullHierarchyTable.less'
import {WidgetListField, WidgetTableMeta} from '../../interfaces/widget'
import {AssociatedItem} from '../../interfaces/operation'
import {Store} from '../../interfaces/store'
import {Dispatch} from 'redux'
import {connect} from 'react-redux'
import {Icon, Skeleton, Table} from 'antd'
import {ColumnProps, TableRowSelection, TableEventListeners} from 'antd/lib/table'
import {DataItem, MultivalueSingleValue, PendingDataItem} from '../../interfaces/data'
import {FieldType} from '../../interfaces/view'
import MultivalueHover from '../ui/Multivalue/MultivalueHover'
import Field from '../Field/Field'
import {useAssocRecords} from '../../hooks/useAssocRecords'
import {$do} from '../../actions/actions'
import {BcFilter, FilterType} from '../../interfaces/filters'
import {buildBcUrl} from '../../utils/strings'
import {RowMetaField} from '../../interfaces/rowMeta'
import FullHierarchyFilter from './FullHierarchyFilter'
import ColumnTitle from '../ColumnTitle/ColumnTitle'
import cn from 'classnames'
import {useHierarchyCache} from './utils/useHierarchyCache'
import {useExpandedKeys} from './utils/useExpandedKeys'

export interface FullHierarchyTableOwnProps {
    meta: WidgetTableMeta,
    nestedData?: FullHierarchyDataItem[],
    assocValueKey?: string,
    depth?: number,
    parentId?: string,
    selectable?: boolean,
    expandedRowKeys?: string[],
    searchPlaceholder?: string,
    onRow?: (record: DataItem, index: number) => TableEventListeners
}

interface FullHierarchyTableProps {
    data: FullHierarchyDataItem[],
    loading: boolean,
    pendingChanges: Record<string, PendingDataItem>,
    bcFilters: BcFilter[],
    rowMetaFields: RowMetaField[],
}

interface FullHierarchyTableDispatchProps {
    onSelect: (bcName: string, depth: number, dataItem: AssociatedItem, widgetName: string, assocValueKey: string) => void,
    onDeselectAll: (bcName: string, depthFrom: number) => void,
    onSelectAll: (bcName: string, parentId: string, depth: number, assocValueKey: string, selected: boolean) => void,
    onSelectFullTable?: (bcName: string, dataItems: AssociatedItem[], assocValueKey: string, selected: boolean) => void,
    addFilter?: (bcName: string, filter: BcFilter) => void,
    removeFilter?: (bcName: string, filter: BcFilter) => void,
}

export interface FullHierarchyDataItem extends AssociatedItem {
    parentId: string,
    level: number
}

export type FullHierarchyTableAllProps = FullHierarchyTableOwnProps & FullHierarchyTableProps & FullHierarchyTableDispatchProps

const emptyData: FullHierarchyDataItem[] = []
const emptyMultivalue: MultivalueSingleValue[] = []
const components = { filter: FullHierarchyFilter }

const Exp: FunctionComponent = (props: any) => {
    if (!props.onExpand || props.record.noChildren) {
        return null
    }
    return <Icon
        style={{ fontSize: '20px' }}
        type={props.expanded ? 'minus-square' : 'plus-square'}
        onClick={e => props.onExpand(props.record, e)}
    />
}

export const FullHierarchyTable: React.FunctionComponent<FullHierarchyTableAllProps> = (props) => {
    const bcName = props.meta.bcName
    const fields = props.meta.fields
    const loading = props.loading
    const depthLevel = props.depth || 1
    const indentLevel = depthLevel - 1

    const textFilters = React.useMemo(() => props.bcFilters?.filter(filter =>
            [FilterType.contains, FilterType.equals].includes(filter.type)),
        [props.bcFilters]
    )
    const [filteredData, searchedAncestorsKeys] = useHierarchyCache(props.meta.name, textFilters, props.data, props.depth)

    const data = (props?.nestedData?.length > 0 && depthLevel > 1)
        ? props.nestedData
        : props?.bcFilters?.length > 0
            ? filteredData
            : props.data

    const selectedRecords = useAssocRecords(data, props.pendingChanges)

    const [expandedKeys, setExpandedKeys] = useExpandedKeys(
        props.expandedRowKeys, selectedRecords, filteredData,
        textFilters, searchedAncestorsKeys
    )

    const handleExpand = (expanded: boolean, dataItem: DataItem) => {
        setExpandedKeys(expanded
            ? [ ...expandedKeys, dataItem.id ]
            : [ ...expandedKeys ].filter(item => item !== dataItem.id)
        )
    }

    const {
        hierarchyGroupSelection,
        hierarchyGroupDeselection,
        hierarchyRadioAll,
        hierarchyRadio: hierarchyRootRadio,
        hierarchyDisableRoot,
        hierarchyDisableParent
    } = props.meta.options ?? {}

    const tableRecords = React.useMemo(
        () => {
            return data?.filter((dataItem) => {
                return dataItem.level === depthLevel && (dataItem.level === 1 || dataItem.parentId === props.parentId)
            })
                .map((filteredItem) => {
                    return {
                        ...filteredItem,
                        noChildren: !data.find((dataItem) => dataItem.parentId === filteredItem.id)
                    }
                })
        },
        [data, props.parentId, depthLevel]
    )

    const rowSelection: TableRowSelection<DataItem> = React.useMemo(() => {
        if (props.selectable) {
            return {
                type: 'checkbox',
                selectedRowKeys: selectedRecords.map(item => item.id),
                onSelectAll: () => {
                    const selected = selectedRecords?.length ? false : true
                    props.onSelectFullTable(bcName, props.data, props.assocValueKey, selected)
                },
                onSelect: (record: AssociatedItem, selected: boolean) => {
                    const dataItem = {
                        ...record,
                        _associate: selected,
                        _value: record[props.assocValueKey],
                    }

                    if (hierarchyRadioAll) {
                        props.onDeselectAll(bcName, depthLevel)
                    } else if (hierarchyRootRadio && depthLevel === 1 && selected) {
                        const rootSelectedRecord = selectedRecords.find((item) => item.level === 1)
                        if (rootSelectedRecord) {
                            props.onSelect(
                                bcName,
                                depthLevel,
                                { ...rootSelectedRecord, _associate: false },
                                props.meta.name,
                                props.assocValueKey
                            )
                        }
                    }

                    if (!selected && hierarchyGroupDeselection || selected && hierarchyGroupSelection) {
                        props.onSelectAll(bcName, record.id, depthLevel + 1, props.assocValueKey, selected)
                    }

                    props.onSelect(bcName, depthLevel, dataItem, props.meta.name, props.assocValueKey)
                }
            }
        }
        return undefined
    }, [bcName, props.onSelect, props.parentId, selectedRecords, props.assocValueKey, depthLevel, props.parentId])

    // Nested hierarchy level is drown by another table
    const nestedHierarchy = (record: DataItem, index: number, indent: number, expanded: boolean) => {
        return <ConnectedFullHierarchyTable
            meta={props.meta}
            assocValueKey={props.assocValueKey}
            depth={depthLevel + 1}
            parentId={record.id}
            selectable={props.selectable}
            onRow={props.onRow}
        />
    }

    // Hierarchy levels are indented by empty columns with calculated width
    const indentColumn = {
        title: '',
        key: '_indentColumn',
        dataIndex: null as string,
        className: cn(styles.selectColumn, styles[`padding${indentLevel}`]),
        width: '100px',
        render: (text: string, dataItem: AssociatedItem): React.ReactNode => {
            return null
        }
    }

    const columns: Array<ColumnProps<DataItem>> = React.useMemo(() => {
        return [
            indentColumn,
            ...fields
                ?.filter((item: WidgetListField) => item.type !== FieldType.hidden && !item.hidden)
                .map((item: WidgetListField) => ({
                    title: <ColumnTitle
                        widgetName={props.meta.name}
                        widgetMeta={item}
                        rowMeta={props.rowMetaFields?.find(rm => rm.key === item.key)}
                        components={components}
                    >
                        {item.title}
                    </ColumnTitle>,
                    key: item.key,
                    dataIndex: item.key,
                    width: item.width || null,
                    className: cn({[styles[`padding${indentLevel}`]]: fields[0].key === item.key && indentLevel}),
                    render: (text: string, dataItem: AssociatedItem) => {
                        if (item.type === FieldType.multivalue) {
                            return <MultivalueHover
                                data={(dataItem[item.key] || emptyMultivalue) as MultivalueSingleValue[]}
                                displayedValue={item.displayedKey && dataItem[item.displayedKey]}
                            />
                        }

                        return <Field
                            bcName={bcName}
                            cursor={dataItem.id}
                            widgetName={props.meta.name}
                            widgetFieldMeta={item}
                            readonly
                        />
                    }
                }))
        ]
    }, [indentLevel, fields, props.meta.name, textFilters])

    return loading
        ? <Skeleton loading paragraph={{rows: 5}}/>
        : <div className={styles.container}>
            <Table
                className={styles.table}
                rowSelection={rowSelection}
                rowKey="id"
                columns={columns}
                pagination={false}
                showHeader={depthLevel === 1}
                expandIcon={Exp as any}
                defaultExpandedRowKeys={undefined}
                expandedRowKeys={expandedKeys}
                onExpand={handleExpand}
                dataSource={tableRecords}
                expandedRowRender={nestedHierarchy}
                expandIconAsCell={false}
                expandIconColumnIndex={(props.selectable) ? 1 : 0}
                loading={loading}
                onRow={!(hierarchyDisableRoot && depthLevel === 1)
                && !(hierarchyDisableParent && !tableRecords.find(item => item.noChildren))
                && props.onRow}
                getPopupContainer={(trigger: HTMLElement) => trigger.parentNode.parentNode as HTMLElement}
            />
        </div>
}

function mapStateToProps(store: Store, ownProps: FullHierarchyTableOwnProps): FullHierarchyTableProps {
    const bcName = ownProps.meta.bcName
    const bc = store.screen.bo.bc[bcName]
    const bcUrl = buildBcUrl(bcName, true)
    const rowMeta = store.view.rowMeta[bcName]?.[bcUrl]
    const loading = bc?.loading || !rowMeta
    return {
        loading: loading,
        data: (loading) ? emptyData : store.data[bcName] as FullHierarchyDataItem[],
        pendingChanges: store.view.pendingDataChanges[bcName],
        bcFilters: store.screen.filters[bcName],
        rowMetaFields: store.view.rowMeta[bcName]?.[bcUrl]?.fields,
    }
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: FullHierarchyTableOwnProps): FullHierarchyTableDispatchProps {
    return {
        onSelect: (bcName: string, depth: number, dataItem: AssociatedItem, widgetName: string, assocValueKey: string) => {
            dispatch($do.changeAssociationFull({ bcName, depth, widgetName: widgetName, dataItem, assocValueKey }))
        },
        onDeselectAll: (bcName: string, depthFrom: number) => {
            dispatch($do.dropAllAssociationsFull({ bcName, depth: depthFrom, dropDescendants: true }))
        },
        onSelectAll: (bcName: string, parentId: string, depth: number, assocValueKey: string, selected: boolean) => {
            dispatch($do.changeDescendantsAssociationsFull({ bcName, parentId, depth, assocValueKey, selected }))
        },
        onSelectFullTable: (bcName: string, dataItems: AssociatedItem[], assocValueKey: string, selected: boolean) => {
            dispatch($do.changeChildrenAssociations({ bcName, assocValueKey, selected }))
        }
    }
}

const ConnectedFullHierarchyTable = connect(mapStateToProps, mapDispatchToProps)(FullHierarchyTable)
export default ConnectedFullHierarchyTable
