import { Store } from '../../interfaces/store'
import { useDispatch } from 'react-redux'
import React from 'react'
import { $do } from '../../actions/actions'
import { useBcProps, useWidgetProps } from '../core'
import { PaginationMode } from '../../interfaces/widget'

export interface PaginationProps {
    /**
     * Name of the widget showing pagination
     */
    widgetName: string
    /**
     * Type of paginator (prev/next buttons, loadMore button, etc.)
     */
    mode: PaginationMode
    /**
     * Callback on page change
     */
    changePageAdditional?: (newPage?: number) => void
}

export function usePagination<S extends Store>({ mode, changePageAdditional, widgetName }: PaginationProps) {
    const { bcName } = useWidgetProps(widgetName)
    const { page, hasNext, loading } = useBcProps({ bcName })

    const dispatch = useDispatch()

    const loadMore = React.useCallback(() => {
        dispatch($do.bcLoadMore({ bcName, widgetName }))

        changePageAdditional?.(page + 1)
    }, [bcName, widgetName, page, dispatch, changePageAdditional])

    const changePage = React.useCallback(
        (newPage: number) => {
            dispatch($do.bcChangePage({ bcName, page: newPage, widgetName }))
        },
        [bcName, widgetName, dispatch]
    )

    const prevPage = React.useCallback(() => {
        const newPage = page - 1

        changePage(newPage)

        changePageAdditional?.(newPage)
    }, [page, changePage, changePageAdditional])

    const nextPage = React.useCallback(() => {
        const newPage = page + 1

        changePage(newPage)

        changePageAdditional?.(newPage)
    }, [page, changePage, changePageAdditional])

    const showPagination = hasNext || (mode === PaginationMode.page && page > 1)

    return {
        nextPage,
        prevPage,
        loadMore,
        hasNext,
        loading,
        page,
        showPagination,
        hidePagination: !showPagination,
        changePage
    }
}
