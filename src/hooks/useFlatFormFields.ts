import React from 'react'
import { isWidgetFieldBlock, WidgetFieldsOrBlocks } from '../interfaces/widget'

/**
 * Получение плоского списка полей из массива, который может содержать как поля, так и блоки из нескольких полей.
 *
 * @template T Тип содержащихся в блоке и возвращаемых полей
 * @param fields Массив полей и блоков полей
 */
export function useFlatFormFields<T>(fields: WidgetFieldsOrBlocks<T>) {
    return React.useMemo(() => {
        const flatFields: T[] = []

        fields.forEach(item => {
            if (isWidgetFieldBlock(item)) {
                item.fields.forEach(field => flatFields.push(field))
            } else {
                flatFields.push(item)
            }
        })

        return flatFields
    }, fields)
}
