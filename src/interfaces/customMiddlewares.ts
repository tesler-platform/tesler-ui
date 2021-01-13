import { Middleware } from 'redux'
import { middlewares } from '../middlewares'
/**
 * Type of core middlewares
 */
export type CoreMiddlewares = typeof middlewares

/**
 * Custom middleware interface
 */
export interface CustomMiddleware {
    /**
     * Implementation of custom middleware
     */
    implementation: Middleware
    /**
     * Priority of custom middleware
     */
    priority: 'BEFORE' | 'AFTER'
}

/**
 * List the names of all core middlewares
 */
export type CoreMiddlewareType = keyof CoreMiddlewares

/**
 * Descriptor of custom middleware not presented in core middlewares
 */
export type NewMiddlewareDescriptor<T = Record<string, unknown>> = Record<Exclude<keyof T, keyof CoreMiddlewares>, CustomMiddleware>

/**
 * Form a dictionary of override descriptors for those middleware
 */
export type CoreMiddlewareOverrideDescriptors = Record<CoreMiddlewareType, Middleware | null>
/**
 * Type of custom middlewares
 */
export type CustomMiddlewares<T = Record<string, unknown>> = Partial<CoreMiddlewareOverrideDescriptors> | NewMiddlewareDescriptor<T>
