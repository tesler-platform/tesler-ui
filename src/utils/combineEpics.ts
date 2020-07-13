/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
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

import {combineEpics as defaultCombineEpics} from 'redux-observable'
import coreEpics from '../epics'
import CustomEpics, {RootEpicSlices, CustomEpicDescriptor, AnyEpic} from '../interfaces/customEpics'

/**
 * Combine customEpics configuration with core epics.
 * If customEpics have a slice with name matching corresponding core slice, each epic in this slice will be handled:
 * - if epic is set to null, core epic will be disabled
 * - if epic is set to some implementation, this implementation will be used instead of core one
 * Epics in slice without matching core epics (and slices without matching core slices) will be handled
 * as new one and behave like in regular combineEpics
 * 
 * @param customEpics
 */
export const combineEpics = (customEpics: CustomEpics) => {
    const coreSlices = Object.keys(coreEpics) as RootEpicSlices[]
    const resultSlices: AnyEpic[] = []
    // Handle root epic slices with core implementations
    coreSlices.forEach(coreSlice => {
        const coreSliceEpics = coreEpics[coreSlice]
        const resultSliceEpics: AnyEpic[] = []
        Object.keys(coreSliceEpics).forEach(epicName => {
            const customImplementation = customEpics[coreSlice]?.[epicName as keyof typeof coreSliceEpics] as CustomEpicDescriptor
            // Null values means disabling the core implementation of epic
            if (customImplementation === null) {
                return
            }
            // Missing custom implementation means the core implementation will be used
            if (!customImplementation) {
                resultSliceEpics.push(coreSliceEpics[epicName as keyof typeof coreSliceEpics])
                return
            }
            // Assigned custom implementation means it'll override the core implementation
            if (customImplementation) {
                resultSliceEpics.push(customImplementation)
                return
            }
        })
        resultSlices.push(defaultCombineEpics(...resultSliceEpics))
    })
    // Handle root epic slices without core implementations
    Object.entries(customEpics)
    .filter(([ slice, epics ]) => {
        return ((coreSlices as string[]).includes(slice) === false)
    })
    .forEach(([ slice, epics ]) => {
        const newSliceEpics = Object.values(epics)
        resultSlices.push(defaultCombineEpics(...newSliceEpics))
    })

    return defaultCombineEpics(...resultSlices)
}

export default combineEpics
