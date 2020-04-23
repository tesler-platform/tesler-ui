import React from 'react'
import {Button, notification} from 'antd'
import i18n from 'i18next'

export const openButtonWarningNotification = (
    description: string,
    buttonText: string,
    duration: number = 0,
    onButtonClick?: () => void,
    key?: string
): string => {
    if (key?.length > 0) {
        notification.close(key)
    }

    const notificationKey = key ? key : `notification_${Date.now()}`
    const btnAction = () => {
        onButtonClick?.()
        notification.close(notificationKey)
    }
    const btn = (
        <Button type="primary" onClick={btnAction}>
        {buttonText}
        </Button>
)

    notification.warning({
        description,
        duration,
        message: i18n.t('Attention'),
        btn: btn,
        key: notificationKey
    })

    return key
}
