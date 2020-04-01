import React from 'react'
import {Dispatch} from 'redux'
import {connect} from 'react-redux'
import {Store} from '../../interfaces/store'
import {Modal, Input} from 'antd'
import {$do} from '../../actions/actions'
import {useTranslation} from 'react-i18next'
import {OperationPostInvokeConfirmType, OperationPostInvokeConfirm} from '../../interfaces/operation'
import styles from './ModalInvoke.less'

interface ModalInvokeProps {
    bcName: string,
    operationType: string,
    widgetName: string,
    confirmOperation: OperationPostInvokeConfirm
    onOk: (bcName: string, operationType: string, widgetName: string, confirm: string) => void,
    onCancel: () => void,
}

const ModalInvoke: React.FunctionComponent<ModalInvokeProps> = (props) => {
    const {t} = useTranslation()
    const [value, setValue] = React.useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value || null)
    }

    const getContent = () => {
        switch (props.confirmOperation.type) {
            case OperationPostInvokeConfirmType.confirm: {
                return <div>
                    <p>{props.confirmOperation?.messageContent || t('Are you sure?')}</p>
                </div>
            }
            case OperationPostInvokeConfirmType.confirmText: {
                return <div>
                {props.confirmOperation?.messageContent && <p>{props.confirmOperation?.messageContent}</p>}
                {<Input value={value} onChange={handleChange}/>}
            </div>
            }
            default:
                return null
        }
    }

    return <Modal
        className={styles.modal}
        visible={true}
        title={props.confirmOperation?.message || t('Perform an additional action?')}
        okText={t('Ok')}
        cancelText={t('Cancel')}
        onOk={() => {
            props.onOk(
                props.bcName,
                props.operationType,
                props.widgetName,
                value || 'ok'
            )
        }}
        onCancel={() => {
            props.onCancel()
        }}
    >
        {getContent()}
    </Modal>
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
        onOk: (bcName: string, operationType: string, widgetName: string, confirm?: string) => {
            dispatch($do.sendOperation({ bcName, operationType, widgetName, confirm}))
            dispatch($do.closeConfirmModal(null))
        },
        onCancel: () => {
            dispatch($do.closeConfirmModal(null))
        }
    }
}

const ConnectedModalInvoke = connect(mapStateToProps, mapDispatchToProps)(ModalInvoke)
export default ConnectedModalInvoke
