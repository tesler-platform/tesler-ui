import { ViewNavigationGroup, MenuItem, ViewNavigationCategory, ViewNavigationItem } from '@tesler-ui/schema'
export { ViewNavigationGroup, MenuItem, ViewNavigationCategory, ViewNavigationItem } from '@tesler-ui/schema'
/**
 * Returns MenuItem if it is ViewNavigationItem
 *
 * @param item to be identified as view
 * @category Type Guards
 */
export function isViewNavigationItem(item: MenuItem): item is ViewNavigationItem {
    return !!item && 'viewName' in item
}

/**
 * @param item
 * @deprecated ViewNavigationCategory will be deleted in 2.0.0
 * @category Type Guards
 */
export function isViewNavigationCategory(item: any): item is ViewNavigationCategory {
    return !!item && 'categoryName' in item
}

/**
 * Returns MenuItem if it is ViewNavigationGroup
 *
 * @param item to be identified as group
 * @category Type Guards
 */
export function isViewNavigationGroup(item: MenuItem): item is ViewNavigationGroup {
    // TODO: remove 'categoryName' check in 2.0.0
    return !!item && 'child' in item && !('categoryName' in item)
}

/**
 * 1 - for static, top level navigation
 * 2 - `SecondLevelMenu` tab widgets
 * 2 - `ThirdLevelMenu` tab widgets
 * 2 - `FourthLevelMenu` tab widgets
 */
export type NavigationLevel = 1 | 2 | 3 | 4

/**
 * Model for displayed tab item
 */
export interface NavigationTab {
    /**
     * View name where navigation tab will redirect the user
     */
    viewName: string
    /**
     * Displayed title: either view name or a group name
     */
    title?: string
}
