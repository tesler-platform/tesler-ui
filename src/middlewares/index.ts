import {createAutoSaveMiddleware} from './autosaveMiddleware'
import {createRequiredFieldsMiddleware} from './requiredFieldsMiddleware'
import {createPreInvokeMiddleware} from './preInvokeMiddleware'

export const middlewares = {
    autosave: createAutoSaveMiddleware?.(),
    requiredFields: createRequiredFieldsMiddleware?.(),
    preInvoke: createPreInvokeMiddleware?.()
}
