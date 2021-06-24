import { ScreenMetaResponse } from './screen'
import { TeslerResponse } from './objectMap'

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
    screens: SessionScreen[]
    loginSpin: boolean
    errorMsg?: string
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
