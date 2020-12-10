import { createAutoSaveMiddleware } from './autosaveMiddleware'
import { createRequiredFieldsMiddleware } from './requiredFieldsMiddleware'
import { createPreInvokeMiddleware } from './preInvokeMiddleware'
import { createActionsHistoryMiddleware } from './actionsHistoryMiddleware'

export const middlewares = {
    actionsHistory: createActionsHistoryMiddleware?.(),
    autosave: createAutoSaveMiddleware?.(),
    requiredFields: createRequiredFieldsMiddleware?.(),
    preInvoke: createPreInvokeMiddleware?.()
}
