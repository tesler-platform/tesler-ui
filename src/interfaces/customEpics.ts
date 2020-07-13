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

 /**
  * This module includes types to support overriding redux-observable Epics that we use in Tesler UI by
  * custom implementations from client application.
  */
import {Epic} from 'redux-observable'
import coreEpics from '../epics'

/**
 * Very loose definition of epic; comes from the situation that client applications
 * does not inherit generic Epic from 'redux-observable` but define their own.
 * TODO: We can probably type it better for 2.0.0 with UI scaffolding.
 */
export type AnyEpic = ($action: any, store: any) => any

/**
 * A union of core epic slices: usually consistent with root reducer slices
 */
export type RootEpicSlices = keyof typeof coreEpics

/**
 * All epics for particular slice
 */
export type SliceEpics<Slice> = Slice extends RootEpicSlices ? typeof coreEpics[Slice] : Record<string, NewEpicDescriptor>

/**
 * Names for all epics in a specified slice
 */
export type SliceEpicsNames<Slice> = keyof SliceEpics<Slice>

/**
 * Client configuration to override or disable specific core epic 
 */
export type CustomEpicDescriptor = AnyEpic | null

/**
 * Describes epics that exists only in client application and do not have a matching core epic
 */
export type NewEpicDescriptor = { [epicName: string]: CustomEpicDescriptor }

/**
 * Client configuration to specific root epic slice
 */
export type CustomEpicSlice<Slice extends RootEpicSlices = any> =
  Partial<Record<SliceEpicsNames<Slice>, CustomEpicDescriptor>> | NewEpicDescriptor

/**
 * A configuration for epics overriding and customization by client application.
 */
export type CustomEpics = {
    [key in RootEpicSlices]?: CustomEpicSlice<key>
} & { [newSlice: string]: CustomEpicSlice }

/**
 * @deprecated TODO: For backward compatibility; remove in 2.0.0 
 */
export type LegacyCustomEpics = Epic<any, any>

/**
 * @deprecated TODO: For backward compatibility; remove in 2.0.0 
 */
export function isLegacyCustomEpics(customEpics: CustomEpics | LegacyCustomEpics): customEpics is LegacyCustomEpics {
    return typeof customEpics === 'function'
}

export default CustomEpics
