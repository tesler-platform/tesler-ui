import React from 'react'
import {Dispatch} from 'redux'
import {connect} from 'react-redux'
import {Store} from '../../interfaces/store'
import {Modal, Input} from 'antd'
import {$do} from '../../actions/actions'
import {useTranslation} from 'react-i18next'
import {OperationPostInvokeConfirmType, OperationModalInvokeConfirm, OperationPreInvokeType} from '../../interfaces/operation'
import styles from './ModalInvoke.less'

interface ModalInvokeProps {
    bcName: string,
    operationType: string,
    widgetName: string,
    confirmOperation: OperationModalInvokeConfirm
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
                    <p>{props.confirmOperation?.message || t('Perform an additional action?')}</p>
                </div>
            }
            case OperationPostInvokeConfirmType.confirmText: {
                return <div>
                    {props.confirmOperation?.message && <p>{props.confirmOperation?.message}</p>}
                    {<Input value={value} onChange={handleChange}/>}
                </div>
            }
            case OperationPreInvokeType.info: {
                return <div>
                    <p>{props.confirmOperation?.message || t('Action has warning')}</p>
                </div>
            }
            case OperationPreInvokeType.error: {
                return <div>
                    <p>{props.confirmOperation?.message || t('Action cannot be performed')}</p>
                </div>
            }
            default:
                return null
        }
    }

    switch (props.confirmOperation.type) {
        case OperationPreInvokeType.info: {
            const modal = Modal.info({
                className: styles.modal,
                title: props.confirmOperation?.messageContent,
                okText: t('Ok'),
                onOk: () => {
                    props.onOk(
                        props.bcName,
                        props.operationType,
                        props.widgetName,
                        value || 'ok'
                    )
                    modal.destroy()
                },
                content: getContent(),

            })
            return null
        }
        case OperationPreInvokeType.error: {
            const modal = Modal.error({
                className: styles.modal,
                title: props.confirmOperation?.messageContent,
                okText: t('Ok'),
                onOk: () => {
                    props.onCancel()
                    modal.destroy()
                },
                content: getContent(),
            })
            return null
        }
        default: {
            return <Modal
                className={styles.modal}
                visible={true}
                title={props.confirmOperation?.messageContent || t('Are you sure?')}
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
    }
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
