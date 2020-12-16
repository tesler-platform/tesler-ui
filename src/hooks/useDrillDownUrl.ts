import {useSelector} from 'react-redux'
import {Store} from '../interfaces/store'
import {WidgetFieldBase} from '../interfaces/widget'
import {buildBcUrl} from '../utils/strings'

/**
 * @param widgetName - widget name passed to field
 * @param cursor - field ID
 * @param fieldMeta - widget field meta
 * @description Allows to override drilldown url from field data by drillDownKey. Checking order allows to disable
 * drilldown link, for example if object is removed.
 */
export function useDrillDownUrl(widgetName: string, fieldMeta: WidgetFieldBase, cursor: string): string | null {
    if (!fieldMeta.drillDown && !fieldMeta.drillDownKey) {
        return null
    }
    const drillDownLink = useSelector((store: Store) => {
        const widgetMeta = store.view.widgets.find((widget) => widget.name === widgetName)
        const record = store.data[widgetMeta.bcName]?.find(dataItem => dataItem.id === cursor)
        const bcUrl = buildBcUrl(widgetMeta.bcName, true)
        const rowMeta = bcUrl && store.view.rowMeta[widgetMeta.bcName]?.[bcUrl]
        if (!rowMeta || !rowMeta.fields) {
            return null
        }
        const rowFieldMeta = rowMeta.fields?.find(field => field.key === fieldMeta.key)
        return record?.[fieldMeta?.drillDownKey] as string || rowFieldMeta?.drillDown || null
    })
    return drillDownLink
}