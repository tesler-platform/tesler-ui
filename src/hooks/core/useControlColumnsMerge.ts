import { useMemo } from 'react'

export type ControlColumnsMergeProps<ColumnProps extends Record<string, any>> = {
    columns: ColumnProps[]
    controlColumns?: Array<{ column: ColumnProps; position: 'left' | 'right' }>
}

export function useControlColumnsMerge<ColumnProps>({ columns, controlColumns }: ControlColumnsMergeProps<ColumnProps>) {
    return useMemo(() => {
        const controlColumnsLeft: ColumnProps[] = []
        const controlColumnsRight: ColumnProps[] = []
        controlColumns?.map(item => {
            item.position === 'left' ? controlColumnsLeft.push(item.column) : controlColumnsRight.push(item.column)
        })
        return [...controlColumnsLeft, ...columns, ...controlColumnsRight]
    }, [columns, controlColumns])
}
