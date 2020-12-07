import React, {FunctionComponent} from 'react'
import {Modal, Form, Collapse, Icon, Button} from 'antd'
import {useTranslation} from 'react-i18next'
import {ApplicationError, SystemError, BusinessError, ApplicationErrorType} from '../../../interfaces/view'
import cn from 'classnames'
import styles from './ErrorPopup.less'
import {css} from '@linaria/core'

export interface ErrorPopupOwnProps {
    className?: string,
    title?: string,
    error: ApplicationError,
    onClose?: () => void
}

const headerUpper = css`
text-transform: uppercase;
color: red;
`

const aa = css`
:global {
    .ant-modal-content {
        border-radius: 0;
    }
}
`
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
        <span className={headerUpper}>
            {props.title || t('Error')}
        </span>
    </header>

    return <Modal
        className={cn(styles.container, props.className, aa)}
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
                        <div>{systemError.details}</div>
                        {systemError?.error &&
                        <>
                            <Button
                                className={styles.copyDetailsBtn}
                                onClick={handleCopyDetails}
                            >
                                {t('Copy details to clipboard')}
                            </Button>
                            <textarea
                                className={cn(styles.detailsArea)}
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
