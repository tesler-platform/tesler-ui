import { Store } from '../../interfaces/store'
import { RowMetaSelectProps, SimpleSelectProps } from '../../interfaces/selectors'
import { useMemo } from 'react'
import { selectorsFactory } from '../../selectors'
import { useSelector } from 'react-redux'

export function useDataProps<S extends Store>(props: SimpleSelectProps) {
    const selectDataProps = useMemo(selectorsFactory.dataProps, [])

    return useSelector((store: S) => selectDataProps(store, props))
}

export function useRowMetaProps<S extends Store>(props: RowMetaSelectProps) {
    const selectRowMetaProps = useMemo(selectorsFactory.rowMetaProps, [])

    return useSelector((store: S) => selectRowMetaProps(store, props))
}

export function usePendingProps<S extends Store>(props: SimpleSelectProps) {
    const selectPendingProps = useMemo(selectorsFactory.pendingProps, [])

    return useSelector((store: S) => selectPendingProps(store, props))
}

export function useBcProps<S extends Store>(props: SimpleSelectProps) {
    const selectBcProps = useMemo(selectorsFactory.bcProps, [])

    return useSelector((store: S) => selectBcProps(store, props))
}

export function useWidgetProps<S extends Store>(widgetName: string) {
    const selectWidgetProps = useMemo(selectorsFactory.widgetProps, [])

    return useSelector((store: S) => selectWidgetProps(store, widgetName))
}
