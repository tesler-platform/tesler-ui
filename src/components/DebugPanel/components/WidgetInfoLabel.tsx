import React from 'react'
import InfoLabel from './InfoLabel'

const WidgetInfoLabel: React.FunctionComponent<{ infoList: string[] }> = ({ infoList }) => {
    return <InfoLabel label="Widget" info={infoList} />
}

export default React.memo(WidgetInfoLabel)
