import React from 'react'
import {Dispatch} from 'redux'
import {connect} from 'react-redux'
import {Store} from '../../interfaces/store'
import {Modal} from 'antd'
import {$do} from '../../actions/actions'
import {useTranslation} from 'react-i18next'
import {OperationPreInvoke} from 'interfaces/operation'

interface ModalInvokeProps {
    bcName: string,
    operationType: string,
    widgetName: string,
    confirmOperation: OperationPreInvoke
    onOk: (bcName: string, operationType: string, widgetName: string, postInvokeConfirm: OperationPreInvoke) => void,
    onCancel: () => void,
}

const ModalInvoke: React.FunctionComponent<ModalInvokeProps> = (props) => {
    const {t} = useTranslation()
    const modal = Modal.confirm({
        title: props.confirmOperation && props.confirmOperation.message || t('Perform an additional action?'),
        content: t('Are you sure?'),
        okText: t('Ok'),
        cancelText: t('Cancel')
    })
    modal.update({
        onOk: () => {
            props.onOk(
                props.bcName,
                props.operationType,
                props.widgetName,
                props.confirmOperation
            )
            modal.destroy()
        },
        onCancel: () => {
            props.onCancel()
        }
    })
    return null
}

function mapStateToProps(store: Store) {
    const {operation, confirmOperation} = store.view.modalInvoke
    return {
        bcName: operation.bcName,
        operationType: operation.operationType,
        widgetName: operation.widgetName,
        confirmOperation,
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onOk: (bcName: string, operationType: string, widgetName: string, confirmOperation?: OperationPreInvoke) => {
            dispatch($do.sendOperation({ bcName, operationType, widgetName, confirmOperation}))
            dispatch($do.closeConfirmModal(null))
        },
        onCancel: () => {
            dispatch($do.closeConfirmModal(null))
        }
    }
}

const ConnectedModalInvoke = connect(mapStateToProps, mapDispatchToProps)(ModalInvoke)
export default ConnectedModalInvoke
