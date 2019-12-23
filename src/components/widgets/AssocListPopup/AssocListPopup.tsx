import React, {FunctionComponent} from 'react'
import {connect} from 'react-redux'
import {$do} from '../../../actions/actions'
import {DataValue} from '../../../interfaces/data'
import {Store} from '../../../interfaces/store'
import {WidgetTableMeta} from '../../../interfaces/widget'
import Popup from '../../ui/Popup/Popup'
import {createMapDispatchToProps} from '../../../utils/redux'
import HierarchyTable from '../../../components/HierarchyTable/HierarchyTable'
import AssocTable from './AssocTable'
import {Skeleton} from 'antd'
import SameBcHierarchyTable from '../../SameBcHierarchyTable/SameBcHierarchyTable'

export interface IAssocListRecord {
    id: string,
    vstamp: number,
    originalSelected: DataValue,
    selected: boolean,
    value?: DataValue
}

export interface IAssocListActions {
    onSave: (bcNames: string[]) => void,
    onCancel: (bcNames: string[]) => void,
    onClose: () => void
}

export interface IAssocListOwnProps {
    widget: WidgetTableMeta
}

export interface IAssocListProps extends IAssocListOwnProps {
    showed: boolean,
    assocValueKey?: string,
    bcLoading: boolean,
}

export const AssocListPopup: FunctionComponent<IAssocListProps & IAssocListActions> = (props) => {
    if (!props.showed) {
        return null
    }

    const {
        onCancel,
        onClose,
        onSave,
    } = props

    const pendingBcNames = props.widget.options && props.widget.options.hierarchy
    ? [props.widget.bcName, ...props.widget.options.hierarchy.map(item => item.bcName)]
    : [props.widget.bcName]

    const saveData = React.useCallback(() => {
        onSave(pendingBcNames)
        onClose()
    }, [onSave, onClose])

    const cancelData = React.useCallback(() => {
        onCancel(pendingBcNames)
        onClose()
    }, [onCancel, onClose])

    return <Popup
        title={props.widget.title}
        showed
        size="large"
        onOkHandler={saveData}
        onCancelHandler={cancelData}
        bcName={props.widget.bcName}
    >
        {(props.bcLoading)
            ? <Skeleton loading paragraph={{rows: 5}} />
            : (props.widget.options && (props.widget.options.hierarchy || props.widget.options.hierarchySameBc))
                ? (props.widget.options.hierarchySameBc)
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
        }
    </Popup>
}

function mapStateToProps(store: Store, ownProps: IAssocListOwnProps) {
    const bcName = ownProps.widget.bcName
    const bc = store.screen.bo.bc[bcName]
    return {
        showed: store.view.popupData.bcName === ownProps.widget.bcName,
        assocValueKey: store.view.popupData.assocValueKey,
        bcLoading: bc && bc.loading
    }
}

const mapDispatchToProps = createMapDispatchToProps(
    (props: IAssocListOwnProps) => {
        return {
            bcName: props.widget.bcName, // TODO: use widgetName instead
           // widgetName: props.widget.name,
        }
    },
    (ctx) => {
        return {
            onCancel: (bcNames: string[]) => {
                ctx.dispatch($do.closeViewPopup({ bcName: ctx.props.bcName }))
            },
            onClose: () => {
                ctx.dispatch($do.closeViewPopup({ bcName: ctx.props.bcName }))
            },
            onSave: (bcNames: string[]) => {
                ctx.dispatch($do.saveAssociations({ bcNames }))
            }
        }
    }
)

const AssocListPopupConnected = connect(
    mapStateToProps,
    mapDispatchToProps
)(AssocListPopup)

export default AssocListPopupConnected
