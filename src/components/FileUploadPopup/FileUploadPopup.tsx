import React from 'react'
import {Upload, Icon} from 'antd'
import {useSelector, useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Store} from '../../interfaces/store'
import {Popup} from '../../components/ui/Popup/Popup'
import {$do} from '../../actions/actions'
import * as styles from './FileUploadPopup.less'
import {getFileUploadEndpoint} from '../../utils/api'

export const FileUploadPopup: React.FC = () => {
    const {t} = useTranslation()
    const popupData = useSelector((state: Store) => state.view.popupData)
    const dispatch = useDispatch()
    const uploadUrl = getFileUploadEndpoint()
    const [ids, setIds] = React.useState<Record<string, string>>({})
    return <div>
        <Popup
            bcName={popupData.bcName}
            showed
            size="medium"
            onOkHandler={() => {
                dispatch($do.bulkUploadFiles({ fileIds: Object.values(ids) }))
            }}
            onCancelHandler={() => dispatch($do.closeViewPopup({ bcName: popupData.bcName }))}
        >
            <Upload.Dragger
                className={styles.dragContainer}
                multiple
                action={uploadUrl}
                onChange={(info) => {
                    if (info.file.status === 'done') {
                        setIds({ ...ids, [info.file.uid]: info.file.response.data.id })
                    }
                }}
                onRemove={(file) => {
                    const newIds = { ...ids }
                    delete newIds[file.uid]
                    setIds(newIds)
                    // TODO: Probably should send delete request
                }}
            >
                    <div className={styles.icon}>
                        <Icon type="inbox" />
                    </div>
                    <div className={styles.text}>
                        {t('Select files')}
                    </div>
            </Upload.Dragger>
        </Popup>
    </div>
}

export default React.memo(FileUploadPopup)
