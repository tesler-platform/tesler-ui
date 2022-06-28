import { PopupWidgetTypes, WidgetMeta, WidgetMetaAny } from '../../interfaces/widget'
import { useSelector } from 'react-redux'
import { Store } from '../../interfaces/store'
import { useBcProps, useDataProps } from './selectors'
import { checkShowCondition } from '../../utils/bc'

export function useShowCondition(widget: WidgetMeta | WidgetMetaAny) {
    const view = useSelector((state: Store) => state.view)
    const legacyPopupCheck = view.popupData.bcName === widget.bcName
    const newPopupCheck = view.popupData.widgetName ? view.popupData.widgetName === widget.name : legacyPopupCheck
    let showWidget = PopupWidgetTypes.includes(widget.type) ? newPopupCheck : true
    const { cursor: cursorForShowCondition } = useBcProps({ bcName: widget.showCondition?.bcName })
    const { data: dataForShowCondition } = useDataProps({ bcName: widget.showCondition?.bcName })

    if (!checkShowCondition(widget.showCondition, cursorForShowCondition, dataForShowCondition, view.pendingDataChanges)) {
        showWidget = false
    }

    return { showWidget, hideWidget: !showWidget }
}
