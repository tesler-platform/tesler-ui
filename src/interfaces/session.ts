import { ScreenMetaResponse } from './screen'
import { TeslerResponse } from './objectMap'

export interface Session {
    active: boolean
    screens: SessionScreen[]
    loginSpin: boolean
    errorMsg?: string
}

export interface LoginResponse extends TeslerResponse {
    screens: SessionScreen[]
    // TODO: Сравнить ответы досье и УОР
}

export interface SessionScreen {
    id: string
    name: string
    text: string // Отображаемое название
    url: string
    defaultScreen?: boolean
    meta?: ScreenMetaResponse
    icon?: string
    notification?: number
}
