import { useSelector } from 'react-redux'
import { Store } from '../interfaces/store'
import { WidgetFieldBase } from '../interfaces/widget'
import { buildBcUrl } from '../utils/strings'

/**
 * @param bcName - bcName passed to field
 * @param cursor - field ID
 * @param fieldMeta - widget field meta
 * @description Allows to override drilldown url from field data by drillDownKey. Checking order allows to disable
 * drilldown link, for example if object is removed.
 * @category Hooks
 */
export function useDrillDownUrl(bcName: string, fieldMeta: WidgetFieldBase, cursor: string): string | null {
    const drillDownLink = useSelector((store: Store) => {
        if (!fieldMeta.drillDown) {
            return null
        }
        const record = store.data[bcName]?.find(dataItem => dataItem.id === cursor)
        const bcUrl = buildBcUrl(bcName, true)
        const rowMeta = bcUrl && store.view.rowMeta[bcName]?.[bcUrl]
        if (!rowMeta || !rowMeta.fields) {
            return null
        }
        const rowFieldMeta = rowMeta.fields?.find(field => field.key === fieldMeta.key)
        return (record?.[fieldMeta?.drillDownKey] as string) || rowFieldMeta?.drillDown || null
    })
    return drillDownLink
}
