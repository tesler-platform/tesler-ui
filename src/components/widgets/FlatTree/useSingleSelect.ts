import React from 'react'
import { DataItem, PendingDataItem, PickMap } from '../../../interfaces/data'
import { useDispatch } from 'react-redux'
import { $do } from '../../../actions/actions'

/**
 *
 * @param pickListDescriptor
 * @param bcName
 * @param parentCursor
 * @param parentBcName
 * @category Hooks
 */
export function useSingleSelect(pickListDescriptor: PickMap, bcName: string, parentCursor: string, parentBcName: string) {
    const dispatch = useDispatch()

    return React.useCallback(
        (selected: DataItem) => {
            const dataItem: PendingDataItem = {}
            if (!pickListDescriptor) {
                return
            }
            Object.entries(pickListDescriptor).forEach(([key, value]) => {
                dataItem[key] = selected[value]
            })
            dispatch($do.changeDataItem({ bcName: parentBcName, cursor: parentCursor, dataItem }))
            dispatch($do.viewClearPickMap(null))
            dispatch($do.closeViewPopup(null))
            dispatch($do.bcRemoveAllFilters({ bcName }))
        },
        [pickListDescriptor, parentCursor, bcName, parentBcName, dispatch]
    )
}
