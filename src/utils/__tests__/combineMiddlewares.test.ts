import { CoreMiddlewares, CustomMiddleware, CustomMiddlewares } from '../../interfaces/customMiddlewares'
import { combineMiddlewares } from '../combineMiddlewares'
import { Dispatch, MiddlewareAPI } from 'redux'
import { AnyAction } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { middlewares } from '../../middlewares'

interface TestCustomMiddlewares extends Partial<CoreMiddlewares> {
    testAutosave: CustomMiddleware
}
describe('combineMiddlewares test', () => {
    const testAutosave = (store: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>) => (next: Dispatch) => (action: AnyAction) => {
        return next(action)
    }
    const coreMiddlewares = middlewares
    const coreMiddlewaresArray = Object.values(coreMiddlewares)
    const coreMiddlewaresLength = coreMiddlewaresArray.length
    it('should return core middlewares', () => {
        expect(combineMiddlewares(coreMiddlewares).length).toEqual(coreMiddlewaresLength)
        expect(combineMiddlewares(coreMiddlewares).findIndex(i => i.name === coreMiddlewares.autosave.name)).toEqual(
            coreMiddlewaresArray.findIndex(i => i.name === coreMiddlewares.autosave.name)
        )
    })
    it('should disable `autosave`', () => {
        const customMiddewares: CustomMiddlewares<TestCustomMiddlewares> = {
            autosave: null
        }
        const callResult = combineMiddlewares(coreMiddlewares, customMiddewares)
        expect(callResult.length).toEqual(coreMiddlewaresLength - 1)
        expect(callResult.findIndex(i => i.name === coreMiddlewares.autosave.name)).toEqual(-1)
        expect(callResult[callResult.length - 1].name).toEqual(coreMiddlewaresArray[coreMiddlewaresLength - 1].name)
    })
    it('should set custom middleware `after`', () => {
        const customMiddewares: CustomMiddlewares<TestCustomMiddlewares> = {
            testAutosave: { implementation: testAutosave, priority: 'AFTER' }
        }
        const callResult = combineMiddlewares(coreMiddlewares, customMiddewares)
        expect(callResult.length).toEqual(coreMiddlewaresLength + 1)
        expect(callResult[coreMiddlewaresLength].name).toEqual('testAutosave')
    })
    it('should set custom middleware `before`', () => {
        const customMiddewares: CustomMiddlewares<TestCustomMiddlewares> = {
            testAutosave: { implementation: testAutosave, priority: 'BEFORE' }
        }
        const callResult = combineMiddlewares(coreMiddlewares, customMiddewares)
        expect(callResult.length).toEqual(coreMiddlewaresLength + 1)
        expect(callResult[0].name).toEqual('testAutosave')
    })
    it('should replace core middleware', () => {
        const testCustomMiddewares: CustomMiddlewares<TestCustomMiddlewares> = {
            autosave: testAutosave
        }
        const callResult = combineMiddlewares(coreMiddlewares, testCustomMiddewares)
        expect(callResult.length).toEqual(coreMiddlewaresLength)
        expect(callResult.findIndex(i => i.name === testCustomMiddewares.autosave.name)).toEqual(
            coreMiddlewaresArray.findIndex(i => i.name === coreMiddlewares.autosave.name)
        )
    })
})
