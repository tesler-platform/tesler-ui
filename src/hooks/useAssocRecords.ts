import React from 'react'
import {AssociatedItem} from '../interfaces/operation'
import {PendingDataItem} from '../interfaces/data'

const emptyData: AssociatedItem[] = []

export function useAssocRecords(
    data: AssociatedItem[], pendingChanges: Record<string, PendingDataItem>, isRadio?: boolean
): [AssociatedItem[] , React.Dispatch<React.SetStateAction<AssociatedItem[]>>] {
    const [selectedRecords, setSelectedRecords] = React.useState(emptyData)
    React.useEffect(() => {
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
        setSelectedRecords(records)
    }, [data, pendingChanges, isRadio])
    return [selectedRecords, setSelectedRecords]
}
