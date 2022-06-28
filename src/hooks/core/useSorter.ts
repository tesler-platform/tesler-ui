import { useBcProps, useWidgetProps } from '../core'
import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { BcSorter } from '../../interfaces/filters'
import { $do } from '../../actions/actions'

export interface SorterProps {
    widgetName: string
    fieldKey: string
}

export function useSorter({ widgetName, fieldKey }: SorterProps) {
    const { bcName, isInfiniteWidgets } = useWidgetProps(widgetName)
    const { sorters, page } = useBcProps({ bcName })
    const sorter = sorters?.find(item => item.fieldName === fieldKey)

    const dispatch = useDispatch()

    const setSort = useCallback(
        (newSorter: BcSorter) => {
            dispatch($do.bcAddSorter({ bcName, sorter: newSorter }))

            isInfiniteWidgets
                ? dispatch(
                      $do.bcFetchDataPages({
                          bcName,
                          widgetName,
                          from: 1,
                          to: page
                      })
                  )
                : dispatch(
                      $do.bcForceUpdate({
                          bcName,
                          widgetName
                      })
                  )
        },
        [bcName, dispatch, isInfiniteWidgets, page, widgetName]
    )

    const toggleSort = useCallback(() => {
        setSort({
            fieldName: fieldKey,
            direction: !sorter ? 'desc' : sorter.direction === 'asc' ? 'desc' : 'asc'
        })
    }, [fieldKey, setSort, sorter])

    return {
        sorter,
        hideSort: !bcName,
        setSort,
        toggleSort
    }
}
