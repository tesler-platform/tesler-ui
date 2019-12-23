export interface Route {
    type: RouteType,
    path: string,
    params: object,
    screenName?: string,
    viewName?: string,
    bcPath?: string
}

export const enum RouteType {
    screen = 'screen',
    default = 'default',
    router = 'router',
    invalid = 'invalid',
    unknown = 'unknown',
}

/**
 * Типы переходов по ссылкам внутри приложения, адреса которых задает бэк
 *
 */
export const enum DrillDownType {
    /**
     * Переход на внутреннюю сущность, т.е. подставляется в часть после хэша роутера: "#/${inner}"
     */
    inner = 'inner',
    /**
     * Переход на адрес относительно текущего: "/${relative}"
     */
    relative = 'relative',
    /**
     * Переход на адрес относительно текущего: "/${relativeNew}" в новой вкладке
     */
    relativeNew = 'relativeNew',
    /**
     * Переход на внешний адрес: "http://${external}"
     */
    external = 'external',
    /**
     * Переход на внешний адрес: "http://${externalNew}" в новой вкладке
     */
    externalNew = 'externalNew'
}
