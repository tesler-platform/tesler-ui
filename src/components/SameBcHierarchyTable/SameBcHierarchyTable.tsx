import React, { FunctionComponent } from 'react'
import {Table, Icon} from 'antd'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import {$do} from '../../actions/actions'
import {Store} from '../../interfaces/store'
import Field from '../../components/Field/Field'
import MultivalueHover from '../../components/ui/Multivalue/MultivalueHover'
import {WidgetTableMeta, WidgetListField} from '../../interfaces/widget'
import {DataItem, MultivalueSingleValue, PendingDataItem } from '../../interfaces/data'
import {ColumnProps, TableRowSelection } from 'antd/lib/table'
import {Route } from '../../interfaces/router'
import {FieldType } from '../../interfaces/view'
import styles from './SameBcHierarchyTable.less'
import {AssociatedItem} from '../../interfaces/operation'
import {useAssocRecords} from '../../hooks/useAssocRecords'

interface SameBcHierarchyTableOwnProps {
    meta: WidgetTableMeta,
    assocValueKey?: string,
    depth?: number,
    selectable?: boolean,
}

export interface SameBcHierarchyTableProps extends SameBcHierarchyTableOwnProps {
    data: AssociatedItem[],
    cursor: string,
    parentCursor: string,
    route: Route,
    loading: boolean,
    pendingChanges: Record<string, PendingDataItem>,
    onDeselectAll?: (bcName: string, depthFrom: number) => void,
    onSelect?: (bcName: string, depth: number, dataItem: AssociatedItem, widgetName: string, assocValueKey: string) => void,
    onSelectAll?: (bcName: string, depth: number, assocValueKey: string, selected: boolean) => void,
    onDrillDown?: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void,
    onExpand: (bcName: string, depth: number, cursor: string) => void
}

const emptyMultivalue: MultivalueSingleValue[] = []

export const Exp: FunctionComponent = (props: any) => {
    if (!props.onExpand) {
        return null
    }
    const type = props.expanded ? 'minus-square' : 'plus-square'
    return <Icon
        style={{ fontSize: '20px' }}
        type={type}
        onClick={(e) => {
            props.onExpand(props.record, e)}
        }
    />
}

const emptyArray: string[] = []
const emptyData: AssociatedItem[] = []

export const SameBcHierarchyTable: FunctionComponent<SameBcHierarchyTableProps> = (props) => {
    const bcName = props.meta.bcName

    const hierarchyGroupSelection = props.meta.options && props.meta.options.hierarchyGroupSelection
    const hierarchyRadioAll = props.meta.options && props.meta.options.hierarchyRadioAll

    const depthLevel = props.depth || 1
    const indentLevel = depthLevel - 1
    const hasNested = props.data && props.data.length

    const [selectedRecords] = useAssocRecords(props.data, props.pendingChanges, hierarchyRadioAll)

    const rowSelection: TableRowSelection<DataItem> = React.useMemo(() => {
        if (props.selectable) {
            return {
                type: 'checkbox',
                selectedRowKeys: selectedRecords.map(item => item.id),
                onSelect: (record: AssociatedItem, selected: boolean) => {
                    const dataItem = {
                        ...record,
                        _associate: selected,
                        _value: record[props.assocValueKey]
                    }

                    if (hierarchyRadioAll) {
                        props.onDeselectAll(bcName, depthLevel)
                    }
                    if (props.cursor === record.id && hierarchyGroupSelection) {
                        props.onSelectAll(bcName, depthLevel + 1, props.assocValueKey, selected)
                    }

                    props.onSelect(bcName, depthLevel, dataItem, props.meta.name, props.assocValueKey)
                }
            }
        }
        return undefined
    }, [bcName, props.onSelect, props.cursor, selectedRecords, props.assocValueKey])

    const [userClosedRecords, setUserClosedRecords] = React.useState([])
    const expandedRowKeys = React.useMemo(() => {
        if (userClosedRecords.includes(props.cursor)) {
            return emptyArray
        }
        return [props.cursor]
    }, [props.cursor, userClosedRecords])

    const handleExpand = (expanded: boolean, dataItem: DataItem) => {
        if (expanded) {
            setUserClosedRecords(userClosedRecords.filter(item => item !== dataItem.id))
            props.onExpand(bcName, depthLevel, dataItem.id)
        } else {
            setUserClosedRecords([ ...userClosedRecords, dataItem.id ])
        }
    }

    // Вложенный уровень иерархии рисуется новой таблицей
    const nested = (record: DataItem, index: number, indent: number, expanded: boolean) => {
        if (record.id !== props.cursor) {
            return null
        }
        return <ConnectedHierarchyTable
            meta={props.meta}
            selectable={props.selectable}
            assocValueKey={props.assocValueKey}
            onDrillDown={null}
            depth={depthLevel + 1}
        />
    }

    const fields = props.meta.fields

    // Уровни иерархии отбиваются отступом через пустую колонку с вычисляемой шириной
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
            ...fields.map((item: WidgetListField) => ({
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
                    if (item.type === FieldType.multifield) {
                        return <Field
                            bcName={bcName}
                            cursor={dataItem.id}
                            widgetName={props.meta.name}
                            widgetFieldMeta={item}
                            readonly
                        />
                    }
                    return text
                }
            }))
        ]
    }, [indentLevel, fields])

    return <div className={styles.container}>
        <Table
            className={styles.table}
            rowSelection={rowSelection}
            rowKey="id"
            columns={columns}
            pagination={false}
            showHeader={depthLevel === 1}
            expandIcon={hasNested ? Exp as any : undefined}
            defaultExpandedRowKeys={[props.cursor]}
            expandedRowKeys={expandedRowKeys}
            onExpand={hasNested ? handleExpand : undefined}
            dataSource={props.data}
            expandedRowRender={hasNested ? nested : undefined}
            expandIconAsCell={false}
            expandIconColumnIndex={1}
            loading={props.loading}
        />
    </div>
}

function mapStateToProps(store: Store, ownProps: SameBcHierarchyTableOwnProps) {
    const depthLevel = ownProps.depth || 1
    const bcMap = store.screen.bo.bc
    const bcName = ownProps.meta.bcName
    const rootBc = bcMap[bcName]
    const currentBc = (depthLevel === 1)
        ? rootBc
        : (rootBc.depthBc && rootBc.depthBc[ownProps.depth])
    const parentBc = (depthLevel === 1)
        ? null
        : (depthLevel === 2)
            ? rootBc
            : rootBc.depthBc && rootBc.depthBc[ownProps.depth - 1]

    const loading = currentBc && currentBc.loading

    const cursor = currentBc && currentBc.cursor
    const parentCursor = parentBc && parentBc.cursor
    const pendingChanges = store.view.pendingDataChanges[bcName]
    return {
        data: (loading)
            ? emptyData
            : (depthLevel === 1)
                ? store.data[bcName]
                : store.depthData[depthLevel] && store.depthData[depthLevel][bcName],
        pendingChanges,
        cursor,
        parentCursor,
        route: store.router,
        loading
    }
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: SameBcHierarchyTableOwnProps) {
    return {
        onExpand: (bcName: string, depth: number, cursor: string) => {
            dispatch($do.bcSelectDepthRecord({ bcName, depth, cursor }))
        },
        onSelect: (bcName: string, depth: number, dataItem: AssociatedItem, widgetName: string, assocValueKey: string) => {
            dispatch($do.changeAssociationSameBc({ bcName, depth, widgetName, dataItem, assocValueKey }))
        },
        onDeselectAll: (bcName: string, depthFrom: number) => {
            dispatch($do.dropAllAssociationsSameBc({ bcName, depthFrom }))
        },
        onSelectAll: (bcName: string, depth: number, assocValueKey: string, selected: boolean) => {
            dispatch($do.changeChildrenAssociationsSameBc({ bcName, depth, assocValueKey, selected }))
        }
    }
}

const ConnectedHierarchyTable = connect(mapStateToProps, mapDispatchToProps)(SameBcHierarchyTable)
export default ConnectedHierarchyTable
