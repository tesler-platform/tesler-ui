import React from 'react'
import { Store } from 'interfaces/store'
import { Button, Tooltip } from 'antd'
import { $do } from '../../../actions/actions'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

interface DebugModeButtonProps {
    className?: string
}

const DebugModeButton: React.FunctionComponent<DebugModeButtonProps> = props => {
    const { className } = props
    const dispatch = useDispatch()
    const mode = useSelector((store: Store) => store.session.debugMode)
    const handleDebugMode = React.useCallback(() => dispatch($do.switchDebugMode(!mode)), [dispatch, mode])
    const { t } = useTranslation()
    const tooltipTitle = t('Show meta')

    return (
        <div className={className}>
            <Tooltip title={tooltipTitle}>
                <Button icon="bug" onClick={handleDebugMode} />
            </Tooltip>
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedDebugModeButton = React.memo(DebugModeButton)

export default MemoizedDebugModeButton
