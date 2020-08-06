import React, {FunctionComponent} from 'react'
import {connect} from 'react-redux'
import {$do} from '../../../actions/actions'
import {DataItem, DataValue, PendingDataItem} from '../../../interfaces/data'
import {Store} from '../../../interfaces/store'
import {WidgetTableMeta} from '../../../interfaces/widget'
import Popup, {PopupProps} from '../../ui/Popup/Popup'
import {createMapDispatchToProps} from '../../../utils/redux'
import HierarchyTable from '../../../components/HierarchyTable/HierarchyTable'
import AssocTable from './AssocTable'
import {Skeleton, Tag} from 'antd'
import SameBcHierarchyTable from '../../SameBcHierarchyTable/SameBcHierarchyTable'
import FullHierarchyTable from '../../FullHierarchyTable/FullHierarchyTable'
import {AssociatedItem} from '../../../interfaces/operation'
import {BcFilter, FilterType} from '../../../interfaces/filters'
import * as styles from '../../ui/Popup/Popup.less'
import {useAssocRecords} from '../../../hooks/useAssocRecords'

export interface IAssocListRecord {
    id: string,
    vstamp: number,
    originalSelected: DataValue,
    selected: boolean,
    value?: DataValue
}

export interface IAssocListActions {
    onSave: (bcNames: string[]) => void,
    onFilter: (bcName: string, filter: BcFilter) => void,
    onDeleteTag: (bcName: string, dataItem: DataItem) => void
    onCancel: () => void,
    onClose: () => void
}

export interface IAssocListOwnProps extends Omit<PopupProps, 'bcName' | 'children' | 'showed'> {
    widget: WidgetTableMeta,
    components?: {
        title?: React.ReactNode,
        table?: React.ReactNode,
        footer?: React.ReactNode
    }
}

export interface IAssocListProps extends IAssocListOwnProps {
    showed: boolean,
    assocValueKey?: string,
    associateFieldKey?: string,
    bcLoading: boolean,
    pendingDataChanges?: {
        [cursor: string]: PendingDataItem
    },
    data?: AssociatedItem[],
    isFilter?: boolean,
    calleeBCName?: string
}

const emptyData: AssociatedItem[] = []

type AssociatedItemTag = Omit<AssociatedItem, 'vstamp'> & {
    _closable?: boolean,
    _value?: string
}

export const AssocListPopup: FunctionComponent<IAssocListProps & IAssocListActions> = (props) => {
    if (!props.showed) {
        return null
    }

    const {
        onCancel,
        onClose,
        onSave,
        onFilter,
        onDeleteTag,

        width,
        components,
        widget,

        showed,
        assocValueKey,
        associateFieldKey,
        bcLoading,
        pendingDataChanges,
        isFilter,
        calleeBCName,
        ...rest
    } = props

    const pendingBcNames = props.widget.options?.hierarchy
    ? [props.widget.bcName, ...props.widget.options?.hierarchy.map(item => item.bcName)]
    : [props.widget.bcName]

    const selectedRecords = useAssocRecords(props.data, props.pendingDataChanges)

    const saveData = React.useCallback(() => {
        onSave(pendingBcNames)
        onClose()
    }, [onSave, onClose])


    const filterData = React.useCallback(() => {
        const filterValue = selectedRecords
        .map(item => item.id)

        onFilter(props.calleeBCName, {
            type: FilterType.equalsOneOf,
            fieldName: props.associateFieldKey,
            value: filterValue
        })
        onClose()
    }, [onFilter, onClose, props.calleeBCName, props.associateFieldKey, selectedRecords])

    const cancelData = React.useCallback(() => {
        onCancel()
        onClose()
    }, [onCancel, onClose])

    const handleDeleteTag = React.useCallback((val: DataItem) => {
        onDeleteTag(props.widget.bcName, val)
    },
        [props.onDeleteTag,props.widget.bcName]
    )

    // Tag values limit
    const tagLimit = 5
    const visibleTags = selectedRecords.slice(0, tagLimit).map(item => ({
        ...item,
        _value: String(item[props.assocValueKey] || ''),
        _closable: true
    }))
    const hiddenTagsCount = visibleTags.length - tagLimit
    const tags: AssociatedItemTag[] = visibleTags.length > tagLimit
        ? [
            ...visibleTags,
            { id: 'control', _associate: false, _value: `... ${hiddenTagsCount}` }
        ]
        : selectedRecords.map(item => ({ ...item, _value: String(item[props.assocValueKey] || ''), _closable: true }))

    const defaultTitle = tags.length
        ? <div>
            <div><h1 className={styles.title}>{props.widget.title}</h1></div>
            <div className={styles.tagArea}>
                {props.assocValueKey && tags?.map(val => {
                    return <Tag
                        title={val._value?.toString()}
                        closable={val._closable}
                        id={val.id?.toString()}
                        key={val.id?.toString()}
                        onClose={() => {
                            handleDeleteTag(val as AssociatedItem)
                        }}
                    >
                        {val._value}
                    </Tag>
                })}
            </div>
        </div>
        : props.widget.title

    const title = props.components?.title === undefined ? defaultTitle : props.components.title

    const defaultTable = (props.widget.options?.hierarchy || props.widget.options?.hierarchySameBc || props.widget.options?.hierarchyFull)
        ? (props.widget.options.hierarchyFull)
            ? <FullHierarchyTable
                meta={props.widget}
                assocValueKey={props.assocValueKey}
                selectable
            />
            : (props.widget.options.hierarchySameBc)
                ? <SameBcHierarchyTable
                    meta={props.widget}
                    assocValueKey={props.assocValueKey}
                    selectable
                />
                : <HierarchyTable
                    meta={props.widget}
                    assocValueKey={props.assocValueKey}
                    selectable
                />
        : <AssocTable
            meta={props.widget}
            disablePagination={true}
        />

    const table = props.components?.table === undefined ? defaultTable : props.components.table

    return <Popup
        title={title}
        showed
        width={props.width}
        size="large"
        onOkHandler={props.isFilter ? filterData : saveData}
        onCancelHandler={cancelData}
        bcName={props.widget.bcName}
        widgetName={props.widget.name}
        disablePagination={props.widget.options?.hierarchyFull}
        footer={props.components?.footer}
        {...rest}
    >
        {(props.bcLoading)
            ? <Skeleton loading paragraph={{rows: 5}} />
            :  {...table}
        }
    </Popup>
}

function mapStateToProps(store: Store, ownProps: IAssocListOwnProps) {
    const bcName = ownProps.widget?.bcName
    const bc = store.screen.bo.bc[bcName]
    const isFilter = store.view.popupData.isFilter
    const calleeBCName = store.view.popupData.calleeBCName
    return {
        showed: store.view.popupData.bcName === bcName,
        assocValueKey: store.view.popupData.assocValueKey,
        associateFieldKey: store.view.popupData.associateFieldKey,
        bcLoading: bc?.loading,
        pendingDataChanges: store.view.pendingDataChanges[bcName],
        data: store.data[bcName] || emptyData,
        isFilter,
        calleeBCName
    }
}

const mapDispatchToProps = createMapDispatchToProps(
    (props: IAssocListOwnProps) => {
        return {
            bcName: props.widget.bcName, // TODO: use widgetName instead
            // widgetName: props.widget.name,
            isFullHierarchy: !!props.widget.options?.hierarchyFull
        }
    },
    (ctx): IAssocListActions => {
        return {
            onCancel: () => {
                ctx.dispatch($do.closeViewPopup({ bcName: ctx.props.bcName }))
                ctx.dispatch($do.bcRemoveAllFilters({ bcName: ctx.props.bcName }))
                if (ctx.props.isFullHierarchy) {
                    ctx.dispatch($do.bcCancelPendingChanges({ bcNames: [ctx.props.bcName] }))
                }
            },
            onClose: () => {
                ctx.dispatch($do.closeViewPopup({ bcName: ctx.props.bcName }))
                ctx.dispatch($do.bcRemoveAllFilters({ bcName: ctx.props.bcName }))
                if (ctx.props.isFullHierarchy) {
                    ctx.dispatch($do.bcCancelPendingChanges({bcNames: [ctx.props.bcName]}))
                }
            },
            onSave: (bcNames: string[]) => {
                ctx.dispatch($do.saveAssociations({ bcNames }))
                if (ctx.props.isFullHierarchy) {
                    ctx.dispatch($do.bcCancelPendingChanges({bcNames: [ctx.props.bcName]}))
                }
            },
            onFilter: (bcName: string, filter: BcFilter) => {
                ctx.dispatch($do.bcAddFilter({ bcName, filter }))
                ctx.dispatch($do.bcForceUpdate({ bcName }))
            },
            onDeleteTag: (
                bcName: string,
                val: AssociatedItem) => {
                ctx.dispatch($do.changeDataItem({
                    bcName,
                    cursor: val.id,
                    dataItem: {
                        ...val,
                        _associate: false,
                    }
                }))
            }
        }
    }
)

const AssocListPopupConnected = connect(
    mapStateToProps,
    mapDispatchToProps
)(AssocListPopup)

export default AssocListPopupConnected
