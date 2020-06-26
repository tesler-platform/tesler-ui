import React, {FunctionComponent} from 'react'
import styles from './FullHierarchyTable.less'
import {WidgetListField, WidgetTableMeta} from '../../interfaces/widget'
import {AssociatedItem} from '../../interfaces/operation'
import {Store} from '../../interfaces/store'
import {Dispatch} from 'redux'
import {connect} from 'react-redux'
import {Icon, Table} from 'antd'
import {ColumnProps, TableRowSelection, TableEventListeners} from 'antd/lib/table'
import {DataItem, MultivalueSingleValue, PendingDataItem} from '../../interfaces/data'
import {FieldType} from '../../interfaces/view'
import MultivalueHover from '../ui/Multivalue/MultivalueHover'
import Field from '../Field/Field'
import {useAssocRecords} from '../../hooks/useAssocRecords'
import {$do} from '../../actions/actions'

export interface FullHierarchyTableOwnProps {
    meta: WidgetTableMeta,
    assocValueKey?: string,
    depth?: number,
    parentId?: string,
    selectable?: boolean,
    onRow?: (record: DataItem, index: number) => TableEventListeners
}

interface FullHierarchyTableProps {
    data: AssociatedItem[],
    loading: boolean,
    pendingChanges: Record<string, PendingDataItem>,
}

interface FullHierarchyTableDispatchProps {
    onSelect: (bcName: string, depth: number, dataItem: AssociatedItem, widgetName: string, assocValueKey: string) => void,
    onDeselectAll: (bcName: string, depthFrom: number) => void,
    onSelectAll: (bcName: string, parentId: string, depth: number, assocValueKey: string, selected: boolean) => void,
    onSelectFullTable?: (bcName: string, dataItems: AssociatedItem[], assocValueKey: string, selected: boolean) => void
}

export type FullHierarchyTableAllProps = FullHierarchyTableOwnProps & FullHierarchyTableProps & FullHierarchyTableDispatchProps

const emptyData: AssociatedItem[] = []
const emptyMultivalue: MultivalueSingleValue[] = []

const Exp: FunctionComponent = (props: any) => {
    if (!props.onExpand || props.record.noChildren) {
        return null
    }
    const type = props.expanded ? 'minus-square' : 'plus-square'
    return <Icon
        style={{ fontSize: '20px' }}
        type={type}
        onClick={e => props.onExpand(props.record, e)}
    />
}

export const FullHierarchyTable: React.FunctionComponent<FullHierarchyTableAllProps> = (props) => {
    const bcName = props.meta.bcName
    const fields = props.meta.fields
    const depthLevel = props.depth || 1
    const indentLevel = depthLevel - 1
    const {
        hierarchyGroupSelection,
        hierarchyGroupDeselection,
        hierarchyRadioAll,
        hierarchyRadio: hierarchyRootRadio,
        hierarchyDisableRoot
    } = props.meta.options ?? {}

    const selectedRecords = useAssocRecords(props.data, props.pendingChanges)
    const [userOpenedRecords, setUserOpenedRecords] = React.useState([])

    const tableRecords = React.useMemo(
        () => {
            return props.data &&
                props.data.filter((dataItem) => {
                    return dataItem.level === depthLevel && (dataItem.level === 1 || dataItem.parentId === props.parentId)
                })
                .map((filteredItem) => {
                    return {
                        ...filteredItem,
                        noChildren: !props.data.find((dataItem) => dataItem.parentId === filteredItem.id)
                    }
                })
        },
        [props.data, props.parentId, depthLevel]
    )

    const [preopenedRecordsInitiated, setPreopenedRecordsInitiated] = React.useState(false)
    if (!preopenedRecordsInitiated && props.data?.length) {
        setPreopenedRecordsInitiated(true)
        setUserOpenedRecords(selectedRecords
            .filter((selectedItem) => {
                const recordData = tableRecords.find((item) => item.id === selectedItem.id)
                return !recordData || !recordData.noChildren
            })
            .map((selectedItem) => selectedItem.id)
        )
    }

    const handleExpand = (expanded: boolean, dataItem: DataItem) => {
        if (expanded) {
            setUserOpenedRecords((prevState) => {
                return [...prevState, dataItem.id]
            })
        } else {
            setUserOpenedRecords((prevState) => {
                return prevState.filter((v) => v !== dataItem.id)
            })
        }
    }

    const rowSelection: TableRowSelection<DataItem> = React.useMemo(() => {
        if (props.selectable) {
            return {
                type: 'checkbox',
                selectedRowKeys: selectedRecords.map(item => item.id),
                onSelectAll: () => {
                    const selected = selectedRecords.length ? false : true
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
        className: styles.selectColumn,
        width: `${50 + indentLevel * 50}px`,
        render: (text: string, dataItem: AssociatedItem): React.ReactNode => {
            return null
        }
    }

    const columns: Array<ColumnProps<DataItem>> = React.useMemo(() => {
        return [
            indentColumn,
            ...fields
                .filter((item: WidgetListField) => item.type !== FieldType.hidden && !item.hidden)
                .map((item: WidgetListField) => ({
                    title: item.title,
                    key: item.key,
                    dataIndex: item.key,
                    render: (text: string, dataItem: any) => {
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
    }, [indentLevel, fields, props.meta.name])

    return <div className={styles.container}>
        <Table
            className={styles.table}
            rowSelection={rowSelection}
            rowKey="id"
            columns={columns}
            pagination={false}
            showHeader={depthLevel === 1}
            expandIcon={Exp as any}
            defaultExpandedRowKeys={undefined}
            expandedRowKeys={userOpenedRecords}
            onExpand={handleExpand}
            dataSource={tableRecords}
            expandedRowRender={nestedHierarchy}
            expandIconAsCell={false}
            expandIconColumnIndex={(props.selectable) ? 1 : 0}
            loading={props.loading}
            onRow={!(hierarchyDisableRoot && depthLevel === 1) && props.onRow}
        />
    </div>
}

function mapStateToProps(store: Store, ownProps: FullHierarchyTableOwnProps): FullHierarchyTableProps {
    const bcName = ownProps.meta.bcName
    const bc = store.screen.bo.bc[bcName]
    const loading = bc?.loading
    return {
        loading: loading,
        data: (loading) ? emptyData : store.data[bcName] as AssociatedItem[],
        pendingChanges: store.view.pendingDataChanges[bcName]
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
