import React, {FunctionComponent} from 'react'
import {Modal, Button} from 'antd'
import {useTranslation} from 'react-i18next'
import Pagination from '../../ui/Pagination/Pagination'
import {PaginationMode} from '../../../interfaces/widget'
import * as styles from './Popup.less'
import {ModalProps} from 'antd/lib/modal'

type AdditionalAntdModalProps = ModalProps

export interface PopupProps extends AdditionalAntdModalProps {
    onOkHandler?: () => void,
    onCancelHandler?: () => void,
    size?: 'medium' | 'large',
    children: any,
    showed: boolean,
    bcName: string,
    widgetName?: string,
    disablePagination?: boolean,
    defaultOkText?: string,
    defaultCancelText?: string
}

export const widths = {
    medium: '570px',
    large: '808px'
}

export const Popup: FunctionComponent<PopupProps> = (props) => {
    const {
        onOkHandler,
        onCancelHandler,
        size,
        children,
        showed,
        bcName,
        widgetName,
        disablePagination,
        defaultOkText,
        defaultCancelText,

        width,
        title,
        footer,
        ...rest
    } = props
    const computedTitle = typeof title !== 'string'
        ? title
        : <h1 className={styles.title}>{title}</h1>
    const computedWidth = width || (size ? widths[size] : widths.medium)
    const {t} = useTranslation()

    const defaultFooter = React.useMemo(() =>
        <div className={styles.footerContainer}>
            {!disablePagination &&
                <div className={styles.pagination}>
                    <Pagination bcName={bcName} mode={PaginationMode.page} widgetName={widgetName}/>
                </div>
            }
            <div className={styles.actions}>
                <Button onClick={onOkHandler} className={styles.buttonYellow}>
                    {defaultOkText ?? t('Save')}
                </Button>
                <Button onClick={onCancelHandler} className={styles.buttonCancel}>
                    {defaultCancelText ?? t('Cancel')}
                </Button>
            </div>
        </div>,
        [disablePagination, bcName, widgetName, onOkHandler, onCancelHandler, defaultOkText, defaultCancelText]
    )

    return <div>
        <Modal
            title={computedTitle}
            className={styles.popupModal}
            visible={showed}
            getContainer={false}
            width={computedWidth}
            onCancel={onCancelHandler}
            footer={footer === null
                ? null
                : footer || defaultFooter
            }
            {...rest}
        >
            {children}
        </Modal>
    </div>
}

export default React.memo(Popup)
