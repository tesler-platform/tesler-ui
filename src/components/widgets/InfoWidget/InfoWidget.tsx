import React from 'react'
import {WidgetInfoField, WidgetInfoMeta} from '../../../interfaces/widget'
import {DataItem} from '../../../interfaces/data'
import {RowMetaField} from '../../../interfaces/rowMeta'
import {useFlatFormFields} from '../../../hooks'
import {Row} from 'antd'
import {Store} from '../../../interfaces/store'
import {buildBcUrl} from '../../../utils/strings'
import {Dispatch} from 'redux'
import {$do} from '../../../actions/actions'
import {connect} from 'react-redux'
import InfoRow from './components/InfoRow'

interface InfoWidgetOwnProps {
    meta: WidgetInfoMeta,
    containerStyle?: string
}

interface InfoWidgetProps extends InfoWidgetOwnProps {
    cursor: string,
    data: DataItem,
    fields: RowMetaField[],
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
}

const InfoWidget: React.FunctionComponent<InfoWidgetProps> = (props) => {
    const options = props.meta.options
    const hiddenKeys: string[] = []
    const flattenWidgetFields = useFlatFormFields<WidgetInfoField>(props.meta.fields)
    .filter((item) => {
        if (!item.hidden) {
            return true
        } else {
            hiddenKeys.push(item.key)
            return false
        }
    })

    const InfoRows = options?.layout?.rows
    .filter((row) => row.cols.find((col) => !hiddenKeys.includes(col.fieldKey)))
    .map((row, index) => <InfoRow
            key={index}
            meta={props.meta}
            data={props.data}
            flattenWidgetFields={flattenWidgetFields}
            fields={props.fields}
            onDrillDown={props.onDrillDown}
            row={row}
            cursor={props.cursor}
            index={index}
        />)

    return <div className={props.containerStyle}>
        <Row>
            {InfoRows}
        </Row>
    </div>
}

const emptyObject = {}

function mapStateToProps(store: Store, ownProps: InfoWidgetOwnProps) {
    const bcName = ownProps.meta.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const bc = store.screen.bo.bc[bcName]
    const bcCursor = bc?.cursor
    const bcData = store.data[bcName]
    return {
        fields: bcUrl && store.view.rowMeta[bcName]?.[bcUrl]?.fields,
        data: bcData?.find(v => v.id === bcCursor) || emptyObject,
        cursor: bcCursor
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => {
            dispatch($do.userDrillDown({ widgetName, cursor, bcName, fieldKey }))
        }
    }
}

InfoWidget.displayName = 'InfoWidget'
export default connect(mapStateToProps, mapDispatchToProps)(InfoWidget)
