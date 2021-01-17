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

/**
 * Types of drilldowns in the application, specified by Tesler API
 */
export const enum DrillDownType {
    /**
     * Drilldown to inner entity of the application (screen, view), i.e. url will be places after route hash sy: `#/${inner}`
     */
    inner = 'inner',
    /**
     * Drilldown to an url relative to the current url: `/${relative}`
     */
    relative = 'relative',
    /**
     * Drilldown to an url relative to the current url: `/${relative}` that opens in a new browser tab
     */
    relativeNew = 'relativeNew',
    /**
     * An external redirect, i.e. `http://${external}`
     */
    external = 'external',
    /**
     * An external redirect, i.e. `http://${external}` that opens in a new browser tab
     */
    externalNew = 'externalNew'
}
