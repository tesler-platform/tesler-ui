import { useDispatch, useSelector } from 'react-redux'
import { Store } from '../../interfaces/store'
import { useCallback } from 'react'
import { $do } from '../../actions/actions'
import { useBcProps, useWidgetProps } from './index'

export function useViewCell({ widgetName, isAllowEdit = false }: { widgetName: string; isAllowEdit?: boolean }) {
    const { bcName } = useWidgetProps(widgetName)
    const { cursor } = useBcProps({ bcName })
    const selectedCell = useSelector((store: Store) => store.view.selectedCell)

    const dispatch = useDispatch()

    const selectCell = useCallback(
        (rowId: string, fieldKey: string) => {
            dispatch($do.selectTableCellInit({ widgetName, rowId, fieldKey }))
        },
        [dispatch, widgetName]
    )

    const isEditModeForCell = useCallback(
        (fieldKey: string, dataItemId: string) => {
            return (
                isAllowEdit &&
                selectedCell &&
                fieldKey === selectedCell.fieldKey &&
                widgetName === selectedCell.widgetName &&
                dataItemId === selectedCell.rowId &&
                cursor === selectedCell.rowId
            )
        },
        [cursor, isAllowEdit, selectedCell, widgetName]
    )

    return {
        selectedCell,
        selectCell,
        isEditModeForCell
    }
}
