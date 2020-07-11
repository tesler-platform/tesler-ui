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

export interface Action<K, P> {
    type: K
    payload: P
}

export type uActionTypesMap<A> = {
    [key in keyof A]: key
}

export type uActionsMap<A> = {
    [key in keyof A]: Action<key, A[key]>
}

export type AnyOfMap<A> = A[keyof A]

export type uActionCreators<A> = {
    [key in keyof A]: (payload: A[key]) => Action<key, A[key]>
}

/**
 * TODO
 *
 * @param actionObj 
 */
export function createActionCreators<A>(actionObj: A): uActionCreators<A> {
    const keys = Object.keys(actionObj)
    const creators = {} as any
    keys.forEach((key) => {
        creators[key] = (payload: any) => ({
            type: key,
            payload: payload
        })
    })
    return creators
}

/**
 * TODO
 *
 * @param actionObj 
 */
export function createActionTypes<A>(actionObj: A): uActionTypesMap<A> {
    const keys = Object.keys(actionObj)
    const types = {} as any
    keys.forEach((key) => {
        types[key] = key
    })
    return types
}
