import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'
import {Resource} from 'i18next'
import getResources from '../assets/i18n'

/**
 * TODO
 *
 * @param lang
 * @param customDictionary
 */
export function initLocale(lang: string, customDictionary: Resource) {
    i18n
    .use(initReactI18next)
    .init({
        resources: getResources(customDictionary),
        lng: lang,
        keySeparator: false,
        interpolation: {
            escapeValue: false
        }
    })
    return i18n
}
