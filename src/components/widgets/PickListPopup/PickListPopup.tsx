import React, {FunctionComponent} from 'react'
import {connect} from 'react-redux'
import {$do} from '../../../actions/actions'
import {Store} from '../../../interfaces/store'
import {WidgetTableMeta} from 'interfaces/widget'
import Popup, {PopupProps} from '../../ui/Popup/Popup'
import {createMapDispatchToProps} from '../../../utils/redux'
import styles from './PickListPopup.less'
import {Table, Skeleton} from 'antd'
import {ColumnProps} from 'antd/es/table'
import {DataItem, PickMap} from '../../../interfaces/data'
import {ChangeDataItemPayload} from '../../Field/Field'
import SameBcHierarchyTable from '../../SameBcHierarchyTable/SameBcHierarchyTable'
import HierarchyTable from '../../../components/HierarchyTable/HierarchyTable'
import FullHierarchyTable from '../../FullHierarchyTable/FullHierarchyTable'
import ColumnTitle from '../../ColumnTitle/ColumnTitle'
import {RowMetaField} from '../../../interfaces/rowMeta'
import {buildBcUrl} from '../../../utils/strings'
import {FieldType} from '../../../interfaces/view'
import Pagination from '../../ui/Pagination/Pagination'
import {PaginationMode} from '../../../interfaces/widget'

export interface PickListPopupActions {
    onChange: (payload: ChangeDataItemPayload) => void,
    onClose: () => void,
}

export interface PickListPopupOwnProps extends Omit<PopupProps, 'bcName' | 'children' | 'showed'> {
    widget: WidgetTableMeta,
    components?: {
        title?: React.ReactNode,
        table?: React.ReactNode,
        footer?: React.ReactNode,
    }
}

export interface PickListPopupProps extends PickListPopupOwnProps {
    data: DataItem[],
    showed: boolean,
    pickMap: PickMap,
    cursor: string,
    parentBCName: string,
    bcLoading: boolean,
    rowMetaFields: RowMetaField[]
}

export const PickListPopup: FunctionComponent<PickListPopupProps & PickListPopupActions> = (props) => {
    const {
        onChange,
        onClose,

        widget,
        components,

        data,
        showed,
        pickMap,
        cursor,
        parentBCName,
        bcLoading,
        rowMetaFields,

        ...rest
    } = props
    const columns: Array<ColumnProps<DataItem>> = props.widget.fields
    .filter(item => item.type !== FieldType.hidden && !item.hidden)
    .map(item => {
        const fieldRowMeta = props.rowMetaFields?.find(field => field.key === item.key)
        return {
            title: <ColumnTitle
                widgetName={props.widget.name}
                widgetMeta={item}
                rowMeta={fieldRowMeta}
            />,
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
                    if (props.cursor) {
                        Object.keys(props.pickMap).forEach((field) => {
                            props.onChange({
                                bcName: props.parentBCName,
                                cursor: props.cursor,
                                dataItem: {[field]: rowData[props.pickMap[field]]}
                            })
                        })
                    }
                    props.onClose()
                }
            }
        },
        [props.pickMap, props.onChange, props.parentBCName, props.cursor]
    )

    const defaultTitle = React.useMemo(() => <div><h1 className={styles.title}>{props.widget.title}</h1></div>, [props.widget.title])
    const title = props.components?.title === undefined ? defaultTitle : props.components.title

    const defaultFooter = React.useMemo(() =>
        <div className={styles.footerContainer}>
            {!props.widget.options?.hierarchyFull &&
                <div className={styles.pagination}>
                    <Pagination bcName={props.widget.bcName} mode={PaginationMode.page} widgetName={props.widget.name}/>
                </div>
            }
        </div>,
        [props.widget.options?.hierarchyFull, props.widget.bcName, props.widget.name]
    )
    const footer = props.components?.footer === undefined ? defaultFooter : props.components.footer

    const defaultTable = (props.widget.options?.hierarchy || props.widget.options?.hierarchySameBc || props.widget.options?.hierarchyFull)
        ? props.widget.options.hierarchyFull
            ? <FullHierarchyTable
                meta={props.widget}
                onRow={onRow}
            />
            : (props.widget.options.hierarchySameBc)
                ? <SameBcHierarchyTable
                    meta={props.widget}
                    onRow={onRow}
                />
                : <HierarchyTable
                    meta={props.widget}
                    onRow={onRow}
                />
        : <div>
            {/* TODO: Replace with TableWidget */}
            <Table
                className={styles.table}
                columns={columns}
                dataSource={props.data}
                rowKey="id"
                onRow={onRow}
                pagination={false}
            />
        </div>
    const table = props.components?.table === undefined ? defaultTable : props.components.table

    return <Popup
        title={title}
        showed={props.showed}
        size="large"
        onOkHandler={props.onClose}
        onCancelHandler={props.onClose}
        bcName={props.widget.bcName}
        widgetName={props.widget.name}
        disablePagination={props.widget.options?.hierarchyFull}
        footer={footer}
        {...rest}
    >
        <div>
            {(props.bcLoading)
                ? <Skeleton loading paragraph={{rows: 5}}/>
                : {...table}
            }
        </div>
    </Popup>
}

function mapStateToProps(store: Store, props: PickListPopupOwnProps) {
    const bcName = props.widget.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const fields = bcUrl && store.view.rowMeta[bcName]?.[bcUrl]?.fields
    const bc = store.screen.bo.bc[bcName]
    const parentBCName = bc?.parentName
    return {
        pickMap: store.view.pickMap,
        showed: store.view.popupData.bcName === props.widget.bcName,
        data: store.data[props.widget.bcName],
        cursor: store.screen.bo.bc[parentBCName]?.cursor,
        parentBCName: bc?.parentName,
        bcLoading: bc?.loading,
        rowMetaFields: fields
    }
}

const mapDispatchToProps = createMapDispatchToProps(
    (props: PickListPopupOwnProps) => {
        return {
            bcName: props.widget.bcName,
        }
    },
    (ctx) => {
        return {
            onChange: (payload: ChangeDataItemPayload) => {
                ctx.dispatch($do.changeDataItem(payload))
            },
            onClose: () => {
                ctx.dispatch($do.viewClearPickMap(null))
                ctx.dispatch($do.closeViewPopup({bcName: ctx.props.bcName}))
            }
        }
    }
)

const PickListPopupConnected = connect(
    mapStateToProps,
    mapDispatchToProps
)(PickListPopup)

export default PickListPopupConnected
