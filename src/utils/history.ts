/**
 * Utilities for urls and browser history
 */
import { getTemplate } from './strings'

/**
 * Appends '/' in front of `absoluteUrl` argument.
 * If `absoluteUrl` alredy starts with `/` then argument returned without changes.
 *
 * @param absoluteUrl Url
 */
export function makeRelativeUrl(absoluteUrl: string) {
    return absoluteUrl.startsWith('/') ? absoluteUrl : `/${absoluteUrl}`
}

/**
 * Parses a business component hierarchy url into a dictionary of business components
 * and their cursors.
 *
 * @param bcPath Business component hierarchy url, e.g. `bcName1/cursor1/bcName2/cursor2`
 * @category Utils
 */
export function parseBcCursors(bcPath: string) {
    if (!bcPath) {
        return null
    }
    const cursors: Record<string, string> = {}
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
 * @category Utils
 */
export function buildUrl(literals: TemplateStringsArray, ...placeholders: Array<string | number>) {
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
