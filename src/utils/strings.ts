/**
 * Утилиты для работы со строками
 */

import {store as globalStore} from '../Provider'
import {Store} from '../interfaces/store'
import moment from 'moment'
import {DataItem} from '../interfaces/data'

/**
 * TODO
 * 
 * @param literals
 * @param placeholders 
 */
export function getTemplate(literals: TemplateStringsArray, ...placeholders: any[]) {
    let result = ''
    for (let i = 0; i < placeholders.length; i++) {
        result += literals[i]
        result += '${' + i + '}'
    }
    result += literals[literals.length - 1]
    return result
}

/**
 * Формирует полный путь к бизнес-компоненте с учетом курсоров и родительских БК
 *
 * @param bcName Имя бизнес-компоненты, для которой надо построить путь
 * @param includeSelf Включать ли в путь собственный курс бизнес-компоненты
 * @param store
 */
export function buildBcUrl(bcName: string, includeSelf: boolean = false, store?: Store) {
    const storeInstance = store || globalStore.getState()
    const bcMap = storeInstance.screen.bo.bc
    const bc = storeInstance.screen.bo.bc[bcName]
    if (!bc) {
        return null
    }
    const url = [(bc.cursor && includeSelf) ? `${bc.name}/${bc.cursor}` : bc.name]
    let nextBc = bc
    while (nextBc.parentName) {
        nextBc = bcMap[nextBc.parentName]
        url.push(`${nextBc.name}/${nextBc.cursor}`)
    }
    const bcUrl = url.reverse().join('/')
    return bcUrl
}

// Token format: '${fieldName:defaultValue}'
const TAG_PLACEHOLDER = /\${([^{}]+)}/g

/**
 * Replaces tokens in a template string with object field values.
 * If the value is like a date, then convert it to the format 'DD.MM.YYYY'
 *
 * Example:
 * const item = { color1: 'Green', color2: 'Blue' }
 * const templatedString = 'Color is ${color1} ${color2:Purple} ${color3:Purple}'
 * format(templateString, item) // => 'Green Blue Purple'
 *
 * @param templatedString Patterned string
 * @param item An object in the fields of which tokens should be searched
 */
const formatString = (templatedString: string, item: DataItem): string => {
    if (!templatedString) {
        return ''
    }
    return templatedString.replace(TAG_PLACEHOLDER, (token, varName) => {
        const [key, defaultValue] = varName.split(':')
        const result = String(item && item[key]
            || defaultValue
            || ''
        )
        const date = moment(result, moment.ISO_8601)
        return !date.isValid()
            ? result
            : date.format('DD.MM.YYYY')
    })
}

const isTemplate = (templatedString: string): boolean => {
    if (!templatedString) {
        return false
    }
    return templatedString.match(TAG_PLACEHOLDER) !== null
}

/**
 * If there is a template in the field name then returns the formatted string
 *
 * @param title Field name
 * @param dataItem An object in the fields of which tokens should be searched
 */
export function getFieldTitle(title: string, dataItem?: DataItem) {
    if (!isTemplate(title)) {
        return title
    } else {
        return formatString(title, dataItem)
    }
}
