import {Resource} from 'i18next'
import ru from './ru.json'
import en from './en.json'

const defaultResources: Resource = {
    en,
    ru
}

/**
 * TODO
 *
 * @param customDictionary
 */
function getResources(customDictionary: Resource) {
    const result = { ...defaultResources }
    if (!customDictionary) {
        return result
    }
    Object.keys(customDictionary).forEach(code => {
        const core = (defaultResources[code]?.translation || {}) as Record<string, string>
        const custom = customDictionary[code].translation as Record<string, string>
        result[code] = {
            translation: {
                ...core,
                ...custom
            }
        }
    })
    return result
}

export default getResources
