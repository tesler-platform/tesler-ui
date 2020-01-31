import React, {FunctionComponent} from 'react'
import {connect} from 'react-redux'
import {$do} from '../../../actions/actions'
import {Store} from '../../../interfaces/store'
import {WidgetListField, WidgetTableMeta} from 'interfaces/widget'
import Popup from '../../ui/Popup/Popup'
import {createMapDispatchToProps} from '../../../utils/redux'
import styles from './PickListPopup.less'
import {Table, Skeleton} from 'antd'
import {ColumnProps} from 'antd/es/table'
import {DataItem, PickMap} from '../../../interfaces/data'
import {ChangeDataItemPayload} from '../../Field/Field'
import SameBcHierarchyTable from '../../SameBcHierarchyTable/SameBcHierarchyTable'
import HierarchyTable from '../../../components/HierarchyTable/HierarchyTable'
import FullHierarchyTable from '../../FullHierarchyTable/FullHierarchyTable'

export interface PickListPopupActions {
    onChange: (payload: ChangeDataItemPayload) => void,
    onClose: () => void,
}

export interface PickListPopupOwnProps {
    widget: WidgetTableMeta,
}

export interface PickListPopupProps extends PickListPopupOwnProps {
    data: DataItem[],
    showed: boolean,
    pickMap: PickMap,
    cursor: string,
    parentBCName: string,
    bcLoading: boolean,
}

export const PickListPopup: FunctionComponent<PickListPopupProps & PickListPopupActions> = (props) => {
    const columns: Array<ColumnProps<DataItem>> = props.widget.fields.map((item: WidgetListField) => ({
        title: item.title,
        key: item.key,
        dataIndex: item.key,
        render: (text, dataItem) => {
            return text
        }
    }))

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

    return <Popup
        showed={props.showed}
        size="large"
        onOkHandler={props.onClose}
        onCancelHandler={props.onClose}
        bcName={props.widget.bcName}
        disablePagination={props.widget.options && props.widget.options.hierarchyFull}
    >
        <div>
            <h2 className={styles.title}>{props.widget.title}</h2>
            {(props.bcLoading)
            ? <Skeleton loading paragraph={{rows: 5}} />
            : (props.widget.options
                && (props.widget.options.hierarchy || props.widget.options.hierarchySameBc || props.widget.options.hierarchyFull)
            )
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
                    <Table
                        className={styles.table}
                        columns={columns}
                        dataSource={props.data}
                        rowKey="id"
                        onRow={onRow}
                        pagination={false}
                    />
                </div>
            }
        </div>
    </Popup>
}

function mapStateToProps(store: Store, props: PickListPopupOwnProps) {
    const bcName = props.widget.bcName
    const bc = store.screen.bo.bc[bcName]
    const parentBCName = bc && bc.parentName
    return {
        pickMap: store.view.pickMap,
        showed: store.view.popupData.bcName === props.widget.bcName,
        data: store.data[props.widget.bcName],
        cursor: parentBCName && store.screen.bo.bc[parentBCName].cursor,
        parentBCName: bc && bc.parentName,
        bcLoading: bc && bc.loading
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
