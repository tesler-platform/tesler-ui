import React from 'react'

/**
 * Позволяет проигнорировать быстрое изменение значения, вернув только последнее полученное до истечения указанной задержки.
 *
 * @param value быстро меняющееся значение
 * @param delay задержка до следующего изменения
 */
export function useDebounce<T>(value: T, delay: number) {
    const [debouncedValue, setDebouncedValue] = React.useState(value)
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)
        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])
    return debouncedValue
}
