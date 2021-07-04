import React from 'react'
import PickInput from '../ui/PickInput/PickInput'
import { $do } from '../../actions/actions'
import { connect } from 'react-redux'
import { PickMap } from '../../interfaces/data'
import ReadOnlyField from '../ui/ReadOnlyField/ReadOnlyField'
import { BaseFieldProps, ChangeDataItemPayload } from '../Field/Field'
import { Store } from '../../interfaces/store'
import { WidgetMeta } from '../../interfaces/widget'
import { WidgetTypes } from '@tesler-ui/schema'

interface IPickListWidgetInputOwnProps extends BaseFieldProps {
    parentBCName: string
    bcName: string
    pickMap: PickMap
    value?: string
    placeholder?: string
}

interface IPickListWidgetInputProps extends IPickListWidgetInputOwnProps {
    popupWidget: WidgetMeta
    onChange: (payload: ChangeDataItemPayload) => void
    onClick: (bcName: string, pickMap: PickMap, widgetName?: string) => void
    /**
     * @deprecated TODO: Remove in 2.0.0; initially existed to prevent race condition
     * when opening popup that still fetches row meta, but after introducing lazy load
     * for popup lost its relevance
     */
    popupRowMetaDone?: boolean
}

/**
 *
 * @param props
 * @category Components
 */
const PickListField: React.FunctionComponent<IPickListWidgetInputProps> = props => {
    if (props.readOnly) {
        return (
            <ReadOnlyField
                widgetName={props.widgetName}
                meta={props.meta}
                className={props.className}
                backgroundColor={props.backgroundColor}
                onDrillDown={props.onDrillDown}
            >
                {props.value}
            </ReadOnlyField>
        )
    }

    const handleClear = React.useCallback(() => {
        Object.keys(props.pickMap).forEach(field => {
            props.onChange({
                bcName: props.parentBCName,
                cursor: props.cursor,
                dataItem: { [field]: '' }
            })
        })
    }, [props.pickMap, props.onChange, props.parentBCName, props.cursor])

    const handleClick = React.useCallback(() => {
        props.onClick(props.bcName, props.pickMap, props.popupWidget.name)
    }, [props.onClick, props.bcName, props.pickMap, props.popupWidget.name])

    return (
        <PickInput
            disabled={props.disabled}
            value={props.value}
            onClick={handleClick}
            onClear={handleClear}
            placeholder={props.placeholder}
        />
    )
}

function mapStateToProps(state: Store, ownProps: IPickListWidgetInputOwnProps) {
    const widgets = state.view.widgets
    const popupWidget = widgets.find(i => i.bcName === ownProps.bcName && i.type === WidgetTypes.PickListPopup)
    return {
        popupWidget
    }
}

const mapDispatchToProps = (dispatch: any) => ({
    onChange: (payload: ChangeDataItemPayload) => {
        return dispatch($do.changeDataItem(payload))
    },
    onClick: (bcName: string, pickMap: PickMap, widgetName?: string) => {
        dispatch($do.showViewPopup({ bcName, widgetName }))
        dispatch($do.viewPutPickMap({ map: pickMap, bcName }))
    }
})

/**
 * @category Components
 */
const ConnectedPickListField = connect(mapStateToProps, mapDispatchToProps)(PickListField)

export default ConnectedPickListField
