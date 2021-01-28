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
export { DrillDownType } from '@tesler-ui/schema'

export interface Route {
    type: RouteType
    path: string
    params: Record<string, unknown>
    screenName?: string
    viewName?: string
    bcPath?: string
}

export const enum RouteType {
    screen = 'screen',
    default = 'default',
    router = 'router',
    invalid = 'invalid',
    unknown = 'unknown'
}
