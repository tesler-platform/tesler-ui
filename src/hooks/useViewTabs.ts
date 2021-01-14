/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useSelector, shallowEqual } from 'react-redux'
import { Store } from '../interfaces/store'
import { getViewTabs } from '../utils/viewTabs'
import { ViewMetaResponse } from '../interfaces/view'
import { MenuItem, ViewNavigationCategory, NavigationLevel } from '../interfaces/navigation'

interface UseViewTabsState {
    activeView: string
    views: ViewMetaResponse[]
    navigation: Array<Exclude<MenuItem, ViewNavigationCategory>>
}

function mapStateToProps(store: Store): UseViewTabsState {
    return {
        activeView: store.view.name,
        views: store.screen.views,
        navigation: store.session.screens.find(screen => screen.name === store.screen.screenName)?.meta.navigation.menu
    }
}

/**
 * Returns an array of tabs for specified level of navigation
 *
 * @param depth 1 for top level navigation; 2, 3, 4 for SecondLevelMenu, ThirdLevelMenu and FourthLevelMenu
 * @category Hooks
 */
export function useViewTabs(depth: NavigationLevel) {
    const state: UseViewTabsState = useSelector(mapStateToProps, shallowEqual)
    const items = getViewTabs(state.navigation, depth, state.activeView)
    return items.map(item => {
        const matchingView = state.views.find(view => view.name === item.viewName)
        return {
            ...item,
            title: item.title || matchingView?.title,
            url: matchingView?.url,
            selected: item.viewName === state.activeView
        }
    })
}
