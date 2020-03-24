import React from 'react'
import {connect} from 'react-redux'
import {Store} from '../../interfaces/store'
import {Dispatch} from 'redux'
import {$do} from '../../actions/actions'
import {applyParams} from '../../utils/api'
import styles from './FileUpload.less'
import {DataItem} from '../../interfaces/data'
import {Icon, Upload} from 'antd'
import {UploadFile} from 'antd/es/upload/interface'
import cn from 'classnames'
import {ChangeDataItemPayload} from '../Field/Field'
import {axiosInstance} from '../../Provider'

export interface FileUploadOwnProps {
    fieldName: string,
    bcName: string,
    cursor: string,
    fieldDataItem: DataItem,
    fieldValue: string,
    fileIdKey: string,
    fileSource: string,
    readOnly?: boolean,
    disabled?: boolean,
    metaError: string,
    snapshotKey?: string,
    snapshotFileIdKey?: string,
}

export interface FileUploadProps {
    fileIdDelta: string,
    fileNameDelta: string,
}

export interface FileUploadActions {
    onDeleteFile: (payload: ChangeDataItemPayload) => void,
    onStartUpload: () => void,
    onUploadFileDone: (payload: ChangeDataItemPayload) => void,
    onUploadFileFailed: () => void
}

const FileUpload: React.FunctionComponent<FileUploadOwnProps & FileUploadProps & FileUploadActions> = (props) => {
    const onUploadSuccess = React.useCallback(
        (response: any, file: UploadFile) => {
            props.onUploadFileDone({
                bcName: props.bcName,
                cursor: props.cursor,
                dataItem: {
                    [props.fileIdKey]: response.data.id,
                    [props.fieldName]: response.data.name
                },
            })
        },
        [props.onUploadFileDone, props.bcName, props.cursor, props.fileIdKey, props.fieldName]
    )

    const onFileDelete = React.useCallback(
        () => {
            props.onDeleteFile({
                bcName: props.bcName,
                cursor: props.cursor,
                dataItem: {
                    [props.fileIdKey]: null,
                    [props.fieldName]: null
                },
            })
        },
        [props.onDeleteFile, props.bcName, props.cursor, props.fileIdKey, props.fieldName]
    )

    const onUploadFailed = React.useCallback(
        (error: any, response: any, file: UploadFile) => {
            props.onUploadFileFailed()
        },
        [props.onUploadFileFailed]
    )

    const {
        fileIdDelta,
        fileNameDelta,
        fieldValue,
        disabled
    } = props

    const downloadParams = {
        source: props.fileSource,
        id: fileIdDelta || (
            props.fileIdKey && props.fieldDataItem?.[props.fileIdKey]?.toString()
        )
    }
    const uploadParams = {
        source: props.fileSource
    }
    const downloadUrl = applyParams(`${axiosInstance.defaults.baseURL || '/'}file`, downloadParams)
    const uploadUrl = applyParams(`${axiosInstance.defaults.baseURL || '/'}file`, uploadParams)

    const uploadProps = {
        disabled: disabled,
        name: 'file',
        action: uploadUrl,
        onStart: props.onStartUpload,
        onError: onUploadFailed,
        onSuccess: onUploadSuccess
    }
    const fileName = fileNameDelta || fieldValue

    if (props.readOnly) {
        if (props.snapshotKey && props.snapshotFileIdKey) {
            const diffDownloadParams = {
                source: props.fileSource,
                id: props.fieldDataItem?.[props.snapshotFileIdKey]?.toString()
            }
            const diffDownloadUrl = applyParams(`${axiosInstance.defaults.baseURL || '/'}file`, diffDownloadParams)
            const diffFileName = props.fieldDataItem?.[props.snapshotKey]

            if ((diffDownloadParams.id || downloadParams.id) && diffDownloadParams.id !== downloadParams.id) {
                return <div>
                    {(diffDownloadParams.id)
                        && <div>
                            <span className={cn(styles.viewLink, styles.prevValue)}>
                                <a href={diffDownloadUrl}>
                                    <Icon type="file" /> <span>{diffFileName}</span>
                                </a>
                            </span>
                        </div>
                    }
                    {(downloadParams.id)
                        && <div>
                            <span className={cn(styles.viewLink, styles.newValue)}>
                                <a href={downloadUrl}>
                                    <Icon type="file" /> <span>{fileName}</span>
                                </a>
                            </span>
                        </div>
                    }
                </div>
            }
        }

        return <span className={styles.viewLink}>
            {(downloadParams.id) &&
                <a href={downloadUrl}>
                    <Icon type="file" /> <span>{fileName}</span>
                </a>
            }
        </span>
    }

    const controls: {[key: string]: React.ReactNode} = {
        deleteButton:
            <div className={styles.deleteButton} onClick={onFileDelete} key="delete-btn">
                <Icon type="delete" title="Удалить"/>
            </div>,

        uploadButton:
            <Upload
                {...uploadProps}
                className={cn(
                    styles.uploadButton,
                    { [styles.error]: props.metaError }
                )}
                key="upload-btn"
            >
                <span title="выберите файл" className={styles.uploadButtonText}>...</span>
            </Upload>,

        uploadLink:
            <Upload
                {...uploadProps}
                className={cn(
                    styles.uploadLink,
                    { [styles.error]: props.metaError }
                )}
                key="upload-lnk"
            >
                <span className={styles.uploadLinkText} title="выберите файл">выберите файл</span>
            </Upload>,

        downloadLink:
            <div className={styles.downloadLink} title={`Скачать ${fileName}`} key="download-lnk">
                <a href={downloadUrl}>
                    <span className={styles.downloadLinkText}>{fileName}</span>
                </a>
            </div>
    }

    return <div
        className={cn(
            styles.fileUpload,
            {
                [styles.disabled]: disabled,
                [styles.error]: props.metaError
            }
        )}
    >
        {disabled
            ? <span className={styles.disabled}>{controls.downloadLink}</span>
            : downloadParams.id
                ? [controls.downloadLink, controls.uploadButton, controls.deleteButton]
                : [controls.uploadLink, controls.uploadButton]
        }
    </div>
}

function mapStateToProps(state: Store, props: FileUploadOwnProps ) {
    const pendingData = state.view.pendingDataChanges[props.bcName]?.[props.cursor]
    return {
        fileIdDelta: !props.readOnly ? pendingData?.[props.fileIdKey] : null,
        fileNameDelta: !props.readOnly && pendingData?.[props.fieldName]
    }
}

function mapDispatchToProps(dispatch: Dispatch): FileUploadActions {
    return {
        onStartUpload: () => {
            dispatch($do.uploadFile(null))
        },
        onDeleteFile: (payload: ChangeDataItemPayload) => {
            dispatch($do.changeDataItem(payload))
        },
        onUploadFileFailed: () => {
            dispatch($do.uploadFileFailed(null))
        },
        onUploadFileDone: (payload: ChangeDataItemPayload) => {
            dispatch($do.changeDataItem(payload))
            dispatch($do.uploadFileDone(null))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FileUpload)
