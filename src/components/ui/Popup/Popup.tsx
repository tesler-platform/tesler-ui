import React, {FunctionComponent} from 'react'
import {Modal, Button} from 'antd'
import {useTranslation} from 'react-i18next'
import Pagination from '../../ui/Pagination/Pagination'
import {PaginationMode} from '../../../interfaces/widget'

import * as styles from './Popup.less'

export interface PopupProps {
    onOkHandler?: () => void,
    onCancelHandler?: () => void,
    size?: 'medium' | 'large',
    children: any,
    showed: boolean,
    title?: React.ReactNode,
    bcName: string,
    widgetName?: string,
    disablePagination?: boolean,
    disableFooterButtons?: boolean,
    OkText?: string,
    cancelText?: string,
}

const widths = {
    medium: '570px',
    large: '808px'
}

export const Popup: FunctionComponent<PopupProps> = (props) => {
    const title = typeof props.title !== 'string'
        ? props.title
        : <h1 className={styles.title}>{props.title}</h1>
    const width = props.size ? widths[props.size] : widths.medium
    const {t} = useTranslation()
    return <div>
        <Modal
            title={title}
            className={styles.popupModal}
            visible={props.showed}
            width={width}
            onCancel={props.onCancelHandler}
            footer={<div className={styles.footerContainer}>
                    {!props.disablePagination &&
                        <div className={styles.pagination}>
                            <Pagination bcName={props.bcName} mode={PaginationMode.page} widgetName={props.widgetName}/>
                        </div>
                    }
                    {!props.disableFooterButtons && <div className={styles.actions}>
                        <Button onClick={props.onOkHandler} className={styles.buttonYellow}>
                            {props.OkText ? props.OkText : t('Save')}
                        </Button>
                        <Button onClick={props.onCancelHandler} className={styles.buttonCancel}>
                            {props.cancelText ? props.cancelText : t('Cancel')}
                        </Button>
                    </div>}
                </div>
            }
        >
            {props.children}
        </Modal>
    </div>
}

export default React.memo(Popup)
