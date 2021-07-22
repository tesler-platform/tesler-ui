import i18n, { Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getTextAssets } from '../assets/i18n'

/**
 * TODO
 *
 * @param lang
 * @param customDictionary
 */
export function initLocale(lang: string, customDictionary: Resource) {
    i18n.use(initReactI18next).init({
        resources: getTextAssets(customDictionary),
        lng: lang,
        keySeparator: false,
        interpolation: {
            escapeValue: false
        }
    })
    return i18n
}
