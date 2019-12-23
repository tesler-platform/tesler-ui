export enum NumberTypes {
    number = 'number',
    percent = 'percent',
    money = 'money'
}

/* Форматеры вывода по типу поля*/
export const NumberInputFormat = {
    [NumberTypes.number]: function number(value: number, digits: number = 0, nullable = true) {
        if (value === null && nullable) {
            return ''
        }
        return getFormattedNumber(value || 0, digits, true)
    },
    // ToDo: по факту формирования требований, отдельный тип поля "деньги" не отличается от числа, возможно его стоит убрать?
    [NumberTypes.money]: function money(value: number, digits: number = 2, nullable = true) {
        if (value === null && nullable) {
            return ''
        }
        return getFormattedNumber(value || 0, digits, true)
    },
    [NumberTypes.percent]: function percent(value: number, digits: number = 0, nullable = true) {
        if (value === null && nullable) {
            return ''
        }
        return getFormattedNumber(value || 0, digits, true) + ' %'
    }
}

export function getFormattedNumber(value: number, digits: number, useGrouping = false): string {
    const precision = getPrecision(digits)
    let result = Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
        useGrouping: useGrouping
    }).format(
        fractionsRound(value, precision)
    )

    // При возвращении числа из fractionsRound сразу без обработки, NumberFormat может вернуть отрицательный ноль
    if (!precision && value < 0 && !result.match(/[1-9]/)) {
        result = result.replace('-', '')
    }

    return result
}

/* Округление дробей до ближайшего числа указанной точности */
export function fractionsRound(value: number, precision: number): number {
    if (value == null || isNaN(value) || !precision) {
        return value
    }
    // Сдвиг разрядов
    const [mant, exp] = value.toString(10).split('e')
    const val: number = Math.round(Number(mant + 'e' + ((exp) ? (Number(exp) + precision) : precision)))
    // Обратный сдвиг
    const [rmant, rexp] = val.toString(10).split('e')
    return Number(rmant + 'e' + ((rexp) ? (Number(rexp) - precision) : -precision))
}

export function getPrecision(digits: number): number {
    let precision = 0
    // определение целевой точности относительно максимально допустимого для Intl форматирования
    if (digits) {
        precision = digits < 0 ? 0
            : digits > 20 ? 20
                : Math.ceil(digits)
    }
    return precision
}
