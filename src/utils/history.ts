/**
 * Утилиты для работы с урлами и адресной строкой браузера
 */
import {getTemplate} from './strings'
import {ObjectMap} from '../interfaces/objectMap'

/**
 * Принимает на вход абсолютный урл вида "url" и возвращает его как относительный: "/url".
 * Если Урл уже начинается со слэша, то он возвращается без изменений.
 * 
 * @param absoluteUrl Урл
 */
export function makeRelativeUrl(absoluteUrl: string) {
    return absoluteUrl.startsWith('/') ? absoluteUrl : `/${absoluteUrl}`
}

/**
 * Раскладывает строку с деревом БК и их курсоров в соответствующий словарь
 *
 * @param bcPath Строка вида 'bcName1/cursor1/bcName2/cursor2'
 */
export function parseBcCursors(bcPath: string) {
    if (!bcPath) {
        return null
    }
    const cursors: ObjectMap<string> = {}
    const tokens = bcPath.split('/')
    for (let i = 0; i < tokens.length; i = i + 2) {
        if (tokens[i + 1]) {
            cursors[tokens[i]] = tokens[i + 1]
        }
    }
    return cursors
}

/**
 * TODO
 * 
 * @param literals
 * @param placeholders 
 */
export function buildUrl(literals: TemplateStringsArray, ...placeholders: Array<string|number>) {
    let result = ''

    for (let i = 0; i < placeholders.length; i++) {
        result += literals[i]
        const placeholder = placeholders[i]

        if (typeof placeholder === 'number') {
            result += placeholder.toString(10)
        } else if (typeof placeholder === 'string') {
            result += encodeURIComponent(placeholder)
        } else {
            const template = getTemplate(literals, placeholders)
            throw new Error(`Неверный тип подстановочного знака в ${template}, index: ${i}, value: ${JSON.stringify(placeholder)}`)
        }
    }

    result += literals[literals.length - 1]
    return result
}
