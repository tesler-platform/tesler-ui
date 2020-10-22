import React, {FunctionComponent} from 'react'
import {Modal, Form, Collapse, Icon, Button} from 'antd'
import {useTranslation} from 'react-i18next'
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
    const errorRef = React.useRef(null)
    const systemError = props.error as SystemError
    const businessError = props.error as BusinessError

    const handleCopyDetails = React.useCallback(
        () => {
            errorRef.current.select()
            document.execCommand('copy')
        },
        [errorRef]
    )
    const {t} = useTranslation()
    const title = <header className={styles.header}>
        <Icon className={styles.icon} type="exclamation-circle-o" />
        <span className={styles.title}>
            {props.title || t('Error')}
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
                    t('System error has been occurred')
                }
                { props.error.type === ApplicationErrorType.NetworkError &&
                    t('There is no connection to the server')
                }
            </Form.Item>
            { props.error.type === ApplicationErrorType.SystemError &&
            <Form.Item label={t('Error code')}>
                {systemError.code}
                <Collapse bordered={false}>
                    <Collapse.Panel header={t('Details')} key="1">
                        {systemError.details}
                        {systemError?.error &&
                        <>
                            <br/>
                            <Button className={styles.mt5}
                                    onClick={handleCopyDetails}>{t('Copy details to clipboard')}</Button>
                            <br/>

                            <textarea
                                className={cn(styles.detailsArea, styles.mt5)}
                                readOnly={true}
                                ref={errorRef}
                                value={JSON.stringify(systemError.error.response, undefined, 2)}
                            />
                        </>
                        }
                    </Collapse.Panel>
                </Collapse>
            </Form.Item>
            }
        </Form>
        {props.children}
    </Modal>
}

export default React.memo(ErrorPopup)
