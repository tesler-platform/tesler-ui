/**
 * Description of the destination in the navigation menu.
 *
 * @param viewName Identifier of view.
 */
export interface ViewNavigationItem {
    id: string
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
 * Description of groups in the navigation menu.
 *
 * Used to create nesting levels of menu items.
 *
 * @param title Title of group. Navigation element shows it to user.
 * @param child Array of navigation elements specified below group(View or inner Group)
 */
export interface ViewNavigationGroup {
    id: string
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
    return !!item && ('child' in item)
}

/**
 * The type of object to describe the menu items in the navigation.
 */
export type MenuItem = ViewNavigationGroup | ViewNavigationItem
