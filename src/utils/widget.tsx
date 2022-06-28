import React from 'react'
import { CustomWidgetDescriptor, isCustomWidget, PopupWidgetTypes, WidgetMeta, WidgetMetaAny } from '../interfaces/widget'

/**
 * Return component instance based on type specified in widget meta
 *
 * @param widgetMeta Meta configuration for widget
 * @param customWidgets Dictionary where key is a widget type and value is a component that should be rendered
 */
export function getWidgetComponent(
    widgetMeta: WidgetMeta | WidgetMetaAny,
    customWidgets: Record<string, CustomWidgetDescriptor>
): JSX.Element {
    const customWidget = customWidgets[widgetMeta.type]

    if (isCustomWidget(customWidget)) {
        const CustomWidgetComponent = customWidget
        return <CustomWidgetComponent meta={widgetMeta} />
    }

    const DescriptorComponent = customWidget.component
    return <DescriptorComponent meta={widgetMeta} />
}

export function skipCardWrap(meta: WidgetMeta, customWidget: CustomWidgetDescriptor) {
    const isEmptyCustomWidgetCard = customWidget && !isCustomWidget(customWidget) && customWidget.card === null
    const isPopupWidget = PopupWidgetTypes.includes(meta.type)

    return isPopupWidget || isEmptyCustomWidgetCard
}

export function getCardWrap(meta: WidgetMeta, customWidget: CustomWidgetDescriptor, defaultCard?: (props: any) => React.ReactElement<any>) {
    return customWidget && !isCustomWidget(customWidget) && customWidget.card ? customWidget.card : defaultCard
}
