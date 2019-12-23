import {ObjectMap} from '../interfaces/objectMap'
import {ViewMetaResponse} from '../interfaces/view'
import {BcMeta, BcMetaState} from '../interfaces/bc'
import {BcFilter, BcSorter} from '../interfaces/filters'

export interface ScreenMetaResponse {
    bo: {
        bc: BcMeta[]
    },
    views: ViewMetaResponse[],
    primary?: string
}

export interface ScreenState {
    screenName: string,
    bo: {
        activeBcName: string,
        bc: ObjectMap<BcMetaState>
    },
    cachedBc: {
        [bcName: string]: string // url
    },
    views: ViewMetaResponse[],
    primaryView: string,
    filters: Record<string, BcFilter[]>,
    sorters: Record<string, BcSorter[]>
}
