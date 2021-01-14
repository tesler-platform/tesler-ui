import React from 'react'
import { AssociatedItem } from '../interfaces/operation'
import { PendingDataItem } from '../interfaces/data'

const emptyData: any[] = []

/**
 * TODO
 *
 * @param data
 * @param pendingChanges
 * @param isRadio
 * @category Hooks
 */
export function useAssocRecords<T extends AssociatedItem>(
    data: T[],
    pendingChanges: Record<string, PendingDataItem>,
    isRadio?: boolean
): T[] {
    return React.useMemo(() => {
        let records = emptyData
        if (data) {
            records = data.filter(item => {
                if (pendingChanges?.[item.id]) {
                    return pendingChanges[item.id]._associate
                }

                if (isRadio && pendingChanges && Object.keys(pendingChanges).length) {
                    return false
                }

                return item?._associate
            })
        }
        return records
    }, [data, pendingChanges, isRadio])
}
