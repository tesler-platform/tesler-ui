import React, { FunctionComponent } from 'react'
import { connect, useSelector } from 'react-redux'
import { Store } from '../../interfaces/store'
import { CustomWidget, CustomWidgetDescriptor, CustomWidgetConfiguration, PopupWidgetTypes, WidgetMeta } from '../../interfaces/widget'
import DashboardLayout from '../ui/DashboardLayout/DashboardLayout'
import { FileUploadPopup } from '../../components/FileUploadPopup/FileUploadPopup'
import ViewInfoLabel from '../DebugPanel/components/ViewInfoLabel'

export interface ViewProps {
    debugMode?: boolean
    widgets: WidgetMeta[]
    skipWidgetTypes?: string[]
    card?: (props: any) => React.ReactElement<any>
    customSpinner?: (props: any) => React.ReactElement<any>
    customWidgets?: Record<string, CustomWidgetDescriptor>
    customLayout?: (props: any) => React.ReactElement<any>
    customFields?: Record<string, CustomWidget>
}

export const CustomizationContext: React.Context<{
    customFields: Record<string, CustomWidget>
}> = React.createContext({
    customFields: {}
})

/**
 *
 * @param props
 * @category Components
 */
export const View: FunctionComponent<ViewProps> = props => {
    let layout: React.ReactNode = null
    usePopupWidgetTypesExtension(props.customWidgets)
    const fileUploadPopup = useSelector((state: Store) => state.view.popupData?.type === 'file-upload')
    if (props.customLayout) {
        layout = (
            <props.customLayout
                customSpinner={props.customSpinner}
                widgets={props.widgets}
                customWidgets={props.customWidgets}
                card={props.card}
                skipWidgetTypes={props.skipWidgetTypes}
            />
        )
    } else {
        layout = (
            <DashboardLayout
                customSpinner={props.customSpinner}
                widgets={props.widgets}
                customWidgets={props.customWidgets}
                card={props.card}
                skipWidgetTypes={props.skipWidgetTypes}
            />
        )
    }

    return (
        <CustomizationContext.Provider value={{ customFields: props.customFields }}>
            {props.debugMode && <ViewInfoLabel />}
            {fileUploadPopup && <FileUploadPopup />}
            {layout}
        </CustomizationContext.Provider>
    )
}

function mapStateToProps(store: Store) {
    return {
        debugMode: store.session.debugMode,
        widgets: store.view.widgets
    }
}

/**
 * @category Components
 */
const ConnectedView = connect(mapStateToProps)(View)

export default ConnectedView

/**
 * Add new values to `PopupWidgetTypes` from client application
 *
 * @param customWidgets
 */
function usePopupWidgetTypesExtension(customWidgets: Record<string, CustomWidgetDescriptor>) {
    if (customWidgets) {
        Object.entries(customWidgets).forEach(([widgetType, descriptor]) => {
            if ((descriptor as CustomWidgetConfiguration).isPopup) {
                PopupWidgetTypes.push(widgetType)
            }
        })
    }
}
