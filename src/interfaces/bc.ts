/**
 * Интерфейсы для Business Component'ы
 */

export interface BcMeta {
    name: string
    parentName: string | null
    url: string,
    cursor: string | null
}

export interface BcMetaState extends BcMeta {
    loading?: boolean
    page?: number
    limit?: number
    hasNext?: boolean
    depthBc?: Record<
        number,
        {
            loading?: boolean,
            cursor?: string,
        }
    >
}
