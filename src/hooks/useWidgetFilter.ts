import React from 'react'
import { useSelector } from 'react-redux'
import { Store } from '../interfaces/store'

/**
 * Get filters from the store for specific widget and field
 *
 * @param widgetName
 * @param fieldKey
 * @category Hooks
 */
export function useWidgetFilters(widgetName: string, fieldKey: string) {
    return useSelector((store: Store) => {
        const viewName = store.view.name
        const widget = store.view.widgets.find(item => item.name === widgetName)
        const filters = store.screen.filters[widget?.bcName]?.filter(item => {
            let match = item.fieldName === fieldKey
            if (item.viewName) {
                match = match && item.viewName === viewName
            }
            if (item.widgetName) {
                match = match && item.widgetName === widget.name
            }
            return match
        })
        return filters || []
    })
}

/**
 *
 * @param widgetName
 * @param fieldKey
 * @category Hooks
 */
export function useWidgetHighlightFilter(widgetName: string, fieldKey: string) {
    const filters = useWidgetFilters(widgetName, fieldKey)
    const filter = filters[0]
    return React.useMemo(() => filter, [filters[0]])
}
