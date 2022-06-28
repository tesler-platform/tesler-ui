import { ScreenMetaResponse } from './screen'
import { TeslerResponse } from './objectMap'
import { RequestType } from './operation'

export interface UserRole {
    type: string
    key: string
    value: string
    description: string
    language: string
    displayOrder: number
    active: boolean
    cacheLoaderName: string
}

export type DefaultNotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
    key: string
    type: DefaultNotificationType | string
    message: string
    options?: {
        messageOptions?: { [key: string]: string | number }
        buttonWarningNotificationOptions?: {
            buttonText: string
            actionsForClick?: Array<Record<string, any>>
        }
    }
    duration?: number
}

export type NotificationKeys = string[]

export interface Session {
    /**
     * Whether dev tools panel is shown
     */
    devPanelEnabled?: boolean
    activeRole?: string
    roles?: UserRole[]
    /**
     * Shows if debug mode is enabled
     */
    debugMode?: boolean
    /**
     * Enables availability of saving redux store and other info on user device.
     * There is need to set it to `true` from client application.
     */
    exportStateEnabled?: boolean
    firstName?: string
    lastName?: string
    login?: string
    active: boolean
    logout: boolean
    screens: SessionScreen[]
    loginSpin: boolean
    errorMsg?: string
    pendingRequests?: PendingRequest[]
    notifications: Notification[]
}

export interface LoginResponse extends TeslerResponse {
    devPanelEnabled?: boolean
    activeRole?: string
    roles?: UserRole[]
    firstName?: string
    lastName?: string
    login?: string
    screens: SessionScreen[]
    // TODO: Сравнить ответы досье и УОР
}

export interface SessionScreen {
    id: string
    name: string
    text: string // Отображаемое название
    url: string
    primary?: string
    defaultScreen?: boolean
    meta?: ScreenMetaResponse
    icon?: string
    notification?: number
}

export interface PendingRequest {
    requestId: string
    type: RequestType
}
