/**
 * A dictionary for a values of specified type
 *
 * @deprecated TODO: Remove in 2.0.0 in favor of native `Record` type
 *
 * @template T Value type
 */
export interface ObjectMap<T> {
    [key: string]: T | undefined
}

/**
 * Basic type for Tesler API responses
 *
 * TODO: Move this to a an appropriate module
 */
export interface TeslerResponse {
    /**
     * If any response returs with this field, browser should redirect on this address
     */
    redirectUrl?: string
}

/**
 * Types of notification messages
 */
export enum AppNotificationType {
    success = 'success',
    info = 'info',
    warning = 'warning',
    error = 'error'
}

export interface SystemNotification {
    id: number,
    type: AppNotificationType,
    message: string
}
