/**
 * Description of the destination in the navigation menu.
 *
 * @param viewName Identifier of view.
 */
export interface ViewNavigationItem {
    /** TODO identifier will be nullable in 2.0.0 */
    id?: string
    viewName: string,
    hidden?: boolean,
}

/**
 * Returns MenuItem if it is ViewNavigationItem
 * 
 * @param item to be identified as view
 */
export function isViewNavigationItem(item: MenuItem): item is ViewNavigationItem {
    return !!item && ('viewName' in item)
}

/**
 * Description of the category in the navigation menu.
 * Used to create nesting levels of menu items.
 * @param categoryName The name of the category.
 * @param child list of categories or menu items included in a category.
 * TODO Deprecated. ViewNavigationCategory will be deleted in 2.0.0
 */
export interface ViewNavigationCategory {
    categoryName: string,
    child: Array<ViewNavigationCategory | ViewNavigationItem>
}

/**
 * @param item
 * TODO Deprecated. ViewNavigationCategory will be deleted in 2.0.0
 */
export function isViewNavigationCategory(item: any): item is ViewNavigationCategory {
    return !!item && ('categoryName' in item)
}

/**
 * Description of groups in the navigation menu.
 *
 * Used to create nesting levels of menu items.
 *
 * @param title Title of group. Navigation element shows it to user.
 * @param child Array of navigation elements specified below group(View or inner Group)
 */
export interface ViewNavigationGroup {
    /** TODO identifier will be nullable and string-only in 2.0.0 */
    id?: string | number,
    title: string,
    child: Array<ViewNavigationGroup | ViewNavigationItem>
    hidden?: boolean
    defaultView?: string
}

/**
 * Returns MenuItem if it is ViewNavigationGroup
 *
 * @param item to be identified as group
 */
export function isViewNavigationGroup(item: MenuItem): item is ViewNavigationGroup {
    // TODO: remove 'title' check in 2.0.0
    return !!item && ('child' in item || 'title' in item)
}

/**
 * The type of object to describe the menu items in the navigation.
 */
export type MenuItem = ViewNavigationGroup | ViewNavigationCategory | ViewNavigationItem
