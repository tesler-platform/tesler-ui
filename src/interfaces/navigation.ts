/**
 * Описание конечного пункта в меню навигации.
 *
 * @param viewName Имя вью.
 */
export interface ViewNavigationItem {
    viewName: string
}

export function isViewNavigationItem(item: any): item is ViewNavigationItem {
    return !!item && ('viewName' in item)
}

/**
 * Описание категории в меню навигации.
 *
 * Используется для создания уровней вложенности пунктов меню.
 *
 * @param categoryName Название категории.
 * @param child Список категорий или пунктов меню, входящих в категорию.
 */
export interface ViewNavigationCategory {
    categoryName: string,
    child: Array<ViewNavigationCategory | ViewNavigationItem>
}

export function isViewNavigationCategory(item: any): item is ViewNavigationCategory {
    return !!item && ('categoryName' in item)
}

/**
 * Описание группы в меню навигации.
 *
 * Используется как корневой элемент, включающий в себя категории и пункты меню.
 *
 * @param title Имя группы.
 * @param child Список категорий или пунктов меню, входящих в группу.
 */
export interface ViewNavigationGroup {
    title: string
    child: Array<ViewNavigationItem | ViewNavigationCategory>
}

export function isViewNavigationGroup(item: any): item is ViewNavigationGroup {
    return !!item && ('title' in item)
}

/**
 * Тип объекта для описания пунктов меню в навигации.
 */
export type MenuItem = ViewNavigationGroup | ViewNavigationCategory | ViewNavigationItem
