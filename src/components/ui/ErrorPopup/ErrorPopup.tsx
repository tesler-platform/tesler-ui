import React, {FunctionComponent} from 'react'
import {Modal, Form, Collapse, Icon} from 'antd'
import {ApplicationError, SystemError, BusinessError, ApplicationErrorType} from '../../../interfaces/view'
import cn from 'classnames'
import styles from './ErrorPopup.less'

export interface ErrorPopupOwnProps {
    className?: string,
    title?: string,
    error: ApplicationError,
    onClose?: () => void
}

export const ErrorPopup: FunctionComponent<ErrorPopupOwnProps> = (props) => {
    const systemError = props.error as SystemError
    const businessError = props.error as BusinessError
    const title = <header className={styles.header}>
        <Icon className={styles.icon} type="exclamation-circle-o" />
        <span className={styles.title}>
            {props.title || 'Ошибка'}
        </span>
    </header>

    return <Modal
        className={cn(styles.container, props.className)}
        title={title}
        visible
        centered
        destroyOnClose
        onCancel={props.onClose}
        footer={null}
    >
        <Form layout="vertical">
            <Form.Item>
                { props.error.type === ApplicationErrorType.BusinessError &&
                    businessError.message
                }
                { props.error.type === ApplicationErrorType.SystemError &&
                    'Произошла системная ошибка'
                }
                { props.error.type === ApplicationErrorType.NetworkError &&
                    'Отсутствует связь с сервером'
                }
            </Form.Item>
            { props.error.type === ApplicationErrorType.SystemError &&
                <React.Fragment>
                    <Form.Item label="Код ошибки">
                        {systemError.code}
                        <Collapse bordered={false}>
                            <Collapse.Panel header="Подробности" key="1">
                                {systemError.details}
                            </Collapse.Panel>
                        </Collapse>
                    </Form.Item>
                </React.Fragment>
            }
        </Form>
        {props.children}
    </Modal>
}

export default ErrorPopup
