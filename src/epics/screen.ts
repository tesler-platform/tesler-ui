import {combineEpics} from 'redux-observable'
import {$do, types, Epic} from '../actions/actions'
import {Observable} from 'rxjs/Observable'
import {
    OperationPostInvokeType,
    OperationPostInvokeRefreshBc,
    OperationPostInvokeDrillDown,
    OperationPostInvokeShowMessage,
    OperationPostInvokeDownloadFile,
    OperationPostInvokeDownloadFileByUrl
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
        case OperationPostInvokeType.postDelete:
            const newBcUrl = state.router.bcPath.split(action.payload.bcName)[0] || ''
            const newUrl = `/screen/${state.router.screenName}/view/${state.router.viewName}/${newBcUrl}`
            historyObj.push(newUrl)
            const cursorsMap: ObjectMap<string> = { [action.payload.bcName]: null }
            return Observable.of($do.bcChangeCursors({ cursorsMap }))
        case OperationPostInvokeType.refreshBC: {
            const bo = state.screen.bo
            const postInvoke = action.payload.postInvoke as OperationPostInvokeRefreshBc
            const postInvokeBCItem = bo.bc[postInvoke.bc]
            const widgetName = (action.payload as any).widgetName // TODO: interface should specify widgetName
            return Observable.of($do.bcFetchDataRequest({
                bcName: postInvokeBCItem.name, widgetName
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
            console.warn(`Операция ${action.payload.postInvoke.type} не поддерживается`)
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

export const screenEpics = combineEpics(
    processPostInvoke,
    downloadFile,
    downloadFileByUrl
)
