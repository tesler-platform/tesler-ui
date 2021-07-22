import { Middleware } from 'redux'
import {
    CustomMiddlewares,
    CoreMiddlewares,
    CustomMiddleware,
    CoreMiddlewareType,
    CoreMiddlewareOverrideDescriptors
} from '../interfaces/customMiddlewares'

export function combineMiddlewares(coreMiddlewares: CoreMiddlewares, customMiddlewares: CustomMiddlewares = null) {
    if (!customMiddlewares) {
        return Object.values(coreMiddlewares)
    }
    const coreMiddlewaresKeys = Object.keys(coreMiddlewares) as CoreMiddlewareType[]

    // get custom middlewares should be placed before core middlewares
    const customMiddlewaresBefore: Middleware[] = []
    const customMiddlewaresAfter: Middleware[] = []
    Object.entries(customMiddlewares)
        .filter(([cMKey, customMiddleware]) => !coreMiddlewaresKeys.includes(cMKey as keyof CoreMiddlewares))
        .forEach(([cMKey, customMiddleware]) => {
            if (((customMiddleware as unknown) as CustomMiddleware)?.priority === 'BEFORE') {
                customMiddlewaresBefore.push(((customMiddleware as unknown) as CustomMiddleware).implementation)
                return
            }
            if (((customMiddleware as unknown) as CustomMiddleware)?.priority === 'AFTER') {
                customMiddlewaresAfter.push(((customMiddleware as unknown) as CustomMiddleware).implementation)
            }
        })

    // if there are present customMiddlewaresBefore then insert them before core middlewares
    const resultMiddlewares: Middleware[] = customMiddlewaresBefore

    // replace or disable core middlewares by custom
    coreMiddlewaresKeys.forEach(coreMiddlewareName => {
        const customMiddleware = (customMiddlewares as CoreMiddlewareOverrideDescriptors)[coreMiddlewareName]
        // Null values means disabling the core implementation of middleware
        if (customMiddleware === null) {
            return
        }
        // Missing custom implementation means the core implementation will be used
        if (!customMiddleware) {
            resultMiddlewares.push(coreMiddlewares[coreMiddlewareName])
            return
        }
        // Assigned custom implementation means it'll override the core implementation
        if (customMiddleware) {
            resultMiddlewares.push(customMiddleware as Middleware)
        }
    })
    return [...resultMiddlewares, ...customMiddlewaresAfter]
}
