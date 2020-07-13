import {$do, types, Epic, AnyAction} from '../actions/actions'
import {Observable} from 'rxjs/Observable'
import {
    OperationPostInvokeType,
    OperationPostInvokeRefreshBc,
    OperationPostInvokeDrillDown,
    OperationPostInvokeShowMessage,
    OperationPostInvokeDownloadFile,
    OperationPostInvokeDownloadFileByUrl,
    OperationPostInvokeConfirmType, OperationPreInvokeType
} from '../interfaces/operation'
import {ObjectMap} from '../interfaces/objectMap'
import {historyObj} from '../reducers/router'
import {axiosInstance} from '../Provider'

const processPostInvoke: Epic = (action$, store) => action$.ofType(types.processPostInvoke)
.mergeMap((action) => {
    const state = store.getState()
    switch (action.payload.postInvoke.type) {
        case OperationPostInvokeType.drillDown:
            return Observable.of($do.drillDown({
                ...action.payload.postInvoke as OperationPostInvokeDrillDown,
                route: state.router,
                widgetName: action.payload.widgetName
            }))
        case OperationPostInvokeType.postDelete: {
            const cursorsMap: ObjectMap<string> = { [action.payload.bcName]: null }
            const result: AnyAction[] = [$do.bcChangeCursors({ cursorsMap })]
            if (state.router.bcPath.includes(`${action.payload.bcName}/`)) {
                const newBcUrl = state.router.bcPath.split(action.payload.bcName)[0] || ''
                const newUrl = `/screen/${state.router.screenName}/view/${state.router.viewName}/${newBcUrl}`
                historyObj.push(newUrl)
            } else {
                result.push($do.bcFetchDataRequest({
                    bcName: action.payload.bcName,
                    widgetName: action.payload.widgetName
                }))
            }
            return Observable.of(...result)
        }
        case OperationPostInvokeType.refreshBC: {
            const bo = state.screen.bo
            const postInvoke = action.payload.postInvoke as OperationPostInvokeRefreshBc
            const postInvokeBC = postInvoke.bc
            const postInvokeBCItem = bo.bc[postInvoke.bc]
            const widgetName = action.payload.widgetName
            const infiniteWidgets: string[] = state.view.infiniteWidgets || []
            const infinitePagination = state.view.widgets
                  .some((item) => item.bcName === postInvokeBC && infiniteWidgets.includes(item.name))
            return infinitePagination
                ? Observable.of($do.bcFetchDataPages({
                    bcName: postInvokeBCItem.name,
                    widgetName: widgetName,
                    from: 1,
                    to: postInvokeBCItem.page
                }))
                : Observable.of($do.bcFetchDataRequest({
                    bcName: postInvokeBCItem.name,
                    widgetName
                }))
        }
        case OperationPostInvokeType.showMessage: {
            const postInvoke = action.payload.postInvoke as OperationPostInvokeShowMessage
            return Observable.of($do.showNotification({ type: postInvoke.messageType, message: postInvoke.messageText }))
        }
        case OperationPostInvokeType.downloadFile: {
            const postInvoke = action.payload.postInvoke as OperationPostInvokeDownloadFile
            return Observable.of($do.downloadFile({ fileId: postInvoke.fileId }))
        }
        case OperationPostInvokeType.downloadFileByUrl: {
            const postInvoke = action.payload.postInvoke as OperationPostInvokeDownloadFileByUrl
            return Observable.of($do.downloadFileByUrl({ url: postInvoke.url }))
        }
        default:
            // Other types can be handled by client application
            return Observable.empty()
    }
})

const downloadFile: Epic = (action$, store) => action$.ofType(types.downloadFile)
.mergeMap((action) => {
    const {
        fileId
    } = action.payload
    const anchor = document.createElement('a')
    anchor.href = `${axiosInstance.defaults.baseURL}file?id=${encodeURIComponent(fileId)}`
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    setTimeout(() => {
        anchor.click()
        document.body.removeChild(anchor)
    }, 100)
    return Observable.empty()
})

const downloadFileByUrl: Epic = (action$, store) => action$.ofType(types.downloadFileByUrl)
.mergeMap((action) => {
    const {
        url
    } = action.payload
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    setTimeout(() => {
        anchor.click()
        document.body.removeChild(anchor)
    }, 100)
    return Observable.empty()
})

const processPostInvokeConfirm: Epic = (action$, store) => action$.ofType(types.processPostInvokeConfirm, types.processPreInvoke)
.mergeMap((action) => {
    const {bcName, operationType, widgetName} = action.payload
    const confirm = action.type === types.processPostInvokeConfirm
        ? action.payload.postInvokeConfirm
        : action.payload.preInvoke
    switch (confirm.type) {
        case OperationPostInvokeConfirmType.confirm:
        case OperationPreInvokeType.info:
        case OperationPreInvokeType.error:
        case OperationPostInvokeConfirmType.confirmText: {
            return Observable.of($do.operationConfirmation({
                operation: {
                    bcName,
                    operationType,
                    widgetName,
                },
                confirmOperation: confirm
            }))
        }
        default:
            return Observable.empty()
    }
})

export const screenEpics = {
    processPostInvoke,
    downloadFile,
    downloadFileByUrl,
    processPostInvokeConfirm
}

export default screenEpics
