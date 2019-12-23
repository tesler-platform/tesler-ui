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

export function createActionTypes<A>(actionObj: A): uActionTypesMap<A> {
    const keys = Object.keys(actionObj)
    const types = {} as any
    keys.forEach((key) => {
        types[key] = key
    })
    return types
}
