import React from 'react'
import {AssociatedItem} from '../interfaces/operation'
import {PendingDataItem} from '../interfaces/data'

const emptyData: AssociatedItem[] = []

/**
 * TODO
 *
 * @param data 
 * @param pendingChanges 
 * @param isRadio 
 */
export function useAssocRecords(
    data: AssociatedItem[], pendingChanges: Record<string, PendingDataItem>, isRadio?: boolean
): AssociatedItem[] {
    return React.useMemo(() => {
        let records = emptyData
        if (data) {
            records = data.filter(item => {
                if (pendingChanges && pendingChanges[item.id]) {
                    return pendingChanges[item.id]._associate
                }

                if (isRadio && pendingChanges && Object.keys(pendingChanges).length) {
                    return false
                }

                return item._associate
            })
        }
        return records
    }, [data, pendingChanges, isRadio])
}
