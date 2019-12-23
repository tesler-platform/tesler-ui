/**
 * Утилиты для работы со строками
 */

import {store as globalStore} from '../Provider'
import {Store} from '../interfaces/store'

// TODO: JSDOC
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
