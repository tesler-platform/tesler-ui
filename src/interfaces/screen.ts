import { ViewMetaResponse } from '../interfaces/view'
import { BcMeta, BcMetaState } from '../interfaces/bc'
import { BcFilter, BcSorter } from '../interfaces/filters'
import { ViewNavigationGroup, ViewNavigationItem } from '../interfaces/navigation'

export interface ScreenMetaResponse {
    bo: {
        bc: BcMeta[]
    }
    views: ViewMetaResponse[]
    primary?: string
    // TODO: Will not be optional in 2.0.0
    navigation?: {
        menu: Array<ViewNavigationGroup | ViewNavigationItem>
    }
}

export interface ScreenState {
    screenName: string
    bo: {
        activeBcName: string
        bc: Record<string, BcMetaState>
    }
    cachedBc: {
        [bcName: string]: string // url
    }
    views: ViewMetaResponse[]
    primaryView: string
    filters: Record<string, BcFilter[]>
    sorters: Record<string, BcSorter[]>
}
