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
import {
    MenuItem,
    ViewNavigationCategory,
    isViewNavigationItem,
    ViewNavigationItem,
    ViewNavigationGroup,
    isViewNavigationGroup,
    NavigationLevel,
    NavigationTab
} from '../interfaces/navigation'
import { breadthFirstSearch } from './breadthFirst'

const emptyArray: NavigationTab[] = []

/**
 * Return navigation tabs array appropriate for specified level of navigation and currently active view
 *
 * @param navigation Navigation `menu` description from screen meta model
 * @param level Target level of navigation
 * @param activeView Currently active view
 */
export function getViewTabs(
    navigation: Array<Exclude<MenuItem, ViewNavigationCategory>>,
    level: NavigationLevel,
    activeView?: string
): NavigationTab[] {
    if (!activeView && level > 1) {
        throw Error('activeView is required for navigation level greater than 1')
    }
    if (!navigation) {
        return emptyArray
    }
    let result: Array<Exclude<MenuItem, ViewNavigationCategory>> = emptyArray
    // First level can be mapped straight away
    if (!activeView || level === 1) {
        result = navigation
    } else {
        navigation
            .filter((item: ViewNavigationGroup) => item.child)
            .some((item: ViewNavigationGroup) => {
                // Group with `activeView` as a direct child or just matching view
                const searchCondition = (node: ViewNavigationGroup | ViewNavigationItem) => {
                    if (isViewNavigationGroup(node)) {
                        const hasDirectMatch = node.child.some((child: ViewNavigationItem) => child.viewName === activeView)
                        return hasDirectMatch
                    }
                    return node.viewName === activeView
                }
                const searchResult = breadthFirstSearch(item, searchCondition)
                // Also the depth should match
                const match = searchResult?.node && searchResult.depth === Math.max(level - 1, 1)
                if (match) {
                    result = searchResult.node.child
                }
                return match
            })
    }
    // Set titles for groups
    return result?.map(item => {
        const title = isViewNavigationGroup(item) ? { title: item.title } : undefined
        return { viewName: getReferencedView(item), ...title }
    })
}

/**
 * Return matching navigation tab for provided navigation item:
 * - view name if item is just a view
 * - group title and referenced view name, where view is found by breadth-first search through group children
 * for default view if `defaultView` is specified on group or first available view otherwise.
 *
 * TODO: Change Exclude<MenuItem, ViewNavigationCategory> to MenuItem in 2.0.0
 *
 * @param navigationItem
 */
export function getReferencedView(navigationItem: Readonly<Exclude<MenuItem, ViewNavigationCategory>>) {
    if (isViewNavigationItem(navigationItem)) {
        return navigationItem.viewName
    }
    // Search condition: defaultView or first available
    const predicate = (node: ViewNavigationItem) => {
        return navigationItem.defaultView ? node.viewName === navigationItem.defaultView : !!node.viewName
    }
    const result = breadthFirstSearch(navigationItem, predicate)?.node as ViewNavigationItem
    return result?.viewName
}
