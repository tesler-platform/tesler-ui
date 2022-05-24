import { of as observableOf, EMPTY } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { $do, types, Epic } from '../actions/actions'
import { OperationPostInvokeConfirmType, OperationPreInvokeType } from '../interfaces/operation'
import { axiosInstance } from '../Provider'
import { processPostInvoke } from './screen/processPostInvoke'
import { apiError } from './screen/apiError'
import { httpError401 } from './screen/httpError401'
import { httpError409 } from './screen/httpError409'
import { httpError418 } from './screen/httpError418'
import { httpError500 } from './screen/httpError500'
import { httpErrorDefault } from './screen/httpErrorDefault'
import { ofType } from 'redux-observable'

/**
 *
 * @param action$
 * @param store$
 * @category Epics
 */
export const downloadFile: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.downloadFile),
        mergeMap(action => {
            const { fileId } = action.payload
            const anchor = document.createElement('a')
            anchor.href = `${axiosInstance.defaults.baseURL}file?id=${encodeURIComponent(fileId)}`
            anchor.style.display = 'none'
            document.body.appendChild(anchor)
            setTimeout(() => {
                anchor.click()
                document.body.removeChild(anchor)
            }, 100)
            return EMPTY
        })
    )

/**
 *
 * @param action$
 * @param store$
 * @category Epics
 */
export const downloadFileByUrl: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.downloadFileByUrl),
        mergeMap(action => {
            const { url } = action.payload
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.style.display = 'none'
            document.body.appendChild(anchor)
            setTimeout(() => {
                anchor.click()
                document.body.removeChild(anchor)
            }, 100)
            return EMPTY
        })
    )

/**
 *
 * @param action$
 * @param store$
 * @category Epics
 */
export const processPostInvokeConfirm: Epic = (action$, store$) =>
    action$.pipe(
        ofType(types.processPostInvokeConfirm, types.processPreInvoke),
        mergeMap(action => {
            const { bcName, operationType, widgetName } = action.payload
            const confirm = action.type === types.processPostInvokeConfirm ? action.payload.postInvokeConfirm : action.payload.preInvoke
            switch (confirm.type) {
                case OperationPostInvokeConfirmType.confirm:
                case OperationPreInvokeType.info:
                case OperationPreInvokeType.error:
                case OperationPostInvokeConfirmType.confirmText: {
                    return observableOf(
                        $do.operationConfirmation({
                            operation: {
                                bcName,
                                operationType,
                                widgetName
                            },
                            confirmOperation: confirm
                        })
                    )
                }
                default:
                    return EMPTY
            }
        })
    )

export const screenEpics = {
    processPostInvoke,
    downloadFile,
    downloadFileByUrl,
    processPostInvokeConfirm,
    apiError,
    httpError401,
    httpError409,
    httpError418,
    httpError500,
    httpErrorDefault
}

export default screenEpics
