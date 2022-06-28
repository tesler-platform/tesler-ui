import { useMemo } from 'react'
import { WidgetListField } from '../../interfaces/widget'
import { FieldType } from '../../interfaces/view'

// TODO MY Реализация взята из компонента, нужно узнать зачем multivalueHover нужен и можно ли его убрать
function normalizeFieldTypes<T extends WidgetListField>(fields: T[]): T[] {
    return fields.map(item => {
        return item.type === FieldType.multivalue ? { ...item, type: FieldType.multivalueHover } : item
    })
}

export function useFieldNormalization<T extends WidgetListField>(fields: T[]): T[] {
    return useMemo(() => normalizeFieldTypes(fields).filter(item => item.type !== FieldType.hidden && !item.hidden), [fields])
}
