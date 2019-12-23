/**
 * Универсальный словарь для объектов заданного типа
 * @template T - тип значений, которые хранятся в словаре
 */
export interface ObjectMap<T> {
    [key: string]: T | undefined
}

/**
 * Базовый тип ответов API
 *
 * @param redirectUrl - если на какой-либо запрос API ответил этим полем,
 * надо немедленно сделать редирект на этот адрес.
 *
 * TODO: Вынести в отдельный файл когда накопятся интерфейсы API
 */
export interface TeslerResponse {
    redirectUrl?: string
}

/**
 * Виды всплывающих сообщений приложения
 */
export const enum AppNotificationType {
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
