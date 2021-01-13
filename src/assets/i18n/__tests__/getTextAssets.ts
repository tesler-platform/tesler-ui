/*
 * TESLER-UI
 * Copyright (C) 2018-2021 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getTextAssets } from '../index'

describe('getResources', () => {
    it('returns dictionary with built-in languages', () => {
        const dictionary = getTextAssets(null)
        expect(dictionary.en.translation['Apply']).toBe('Apply')
        expect(dictionary.ru.translation['Apply']).toBe('Применить')
    })

    it('allows new languages', () => {
        const dictionary = getTextAssets({
            dk: {
                translation: {
                    Apply: 'Ansøge'
                }
            }
        })
        expect(dictionary.en.translation['Apply']).toBe('Apply')
        expect(dictionary.dk.translation['Apply']).toBe('Ansøge')
    })

    it('allows new tokens for existing languages', () => {
        const dictionary = getTextAssets({
            en: {
                translation: {
                    'Some new button': 'Some New Button'
                }
            }
        })
        expect(dictionary.en.translation['Some new button']).toBe('Some New Button')
    })

    it('overrides existing tokens with custom ones', () => {
        const dictionary = getTextAssets({
            en: {
                translation: {
                    Apply: 'Send for apply'
                }
            }
        })
        expect(dictionary.en.translation['Apply']).toBe('Send for apply')
    })
})
