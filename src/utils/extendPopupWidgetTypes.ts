import { CustomWidgetDescriptor, isCustomWidgetConfiguration, PopupWidgetTypes } from '../interfaces/widget'

/**
 * Add new values to `PopupWidgetTypes` from client application
 *
 * @param customWidgets client's widgets
 */
function extendPopupWidgetTypes(customWidgets: Record<string, CustomWidgetDescriptor>) {
    if (customWidgets) {
        Object.entries(customWidgets).forEach(([widgetType, descriptor]) => {
            if (isCustomWidgetConfiguration(descriptor) && descriptor.isPopup) {
                if (!PopupWidgetTypes.includes(widgetType)) {
                    PopupWidgetTypes.push(widgetType)
                }
            }
        })
    }
}

export default extendPopupWidgetTypes
