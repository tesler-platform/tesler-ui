import React, {FunctionComponent} from 'react'
import {connect, useSelector} from 'react-redux'
import {Store} from '../../interfaces/store'
import {CustomWidget, CustomWidgetDescriptor, WidgetMeta} from '../../interfaces/widget'
import DashboardLayout from '../ui/DashboardLayout/DashboardLayout'
import {FileUploadPopup} from '../../components/FileUploadPopup/FileUploadPopup'

export interface ViewProps {
    widgets: WidgetMeta[],
    skipWidgetTypes?: string[],
    card?: (props: any) => React.ReactElement<any>,
    customWidgets?: Record<string, CustomWidgetDescriptor>,
    customLayout?: (props: any) => React.ReactElement<any>,
    customFields?: Record<string, CustomWidget>
}

export const CustomizationContext: React.Context<{
    customFields: Record<string, CustomWidget>
}> = React.createContext({
    customFields: {}
})

export const View: FunctionComponent<ViewProps> = (props) => {
    let layout: React.ReactNode = null
    const fileUploadPopup = useSelector((state: Store) => state.view.popupData?.type === 'file-upload')
    if (props.customLayout) {
        layout = <props.customLayout
            widgets={props.widgets}
            customWidgets={props.customWidgets}
            card={props.card}
            skipWidgetTypes={props.skipWidgetTypes}
        />
    } else {
        layout = <DashboardLayout
            widgets={props.widgets}
            customWidgets={props.customWidgets}
            card={props.card}
            skipWidgetTypes={props.skipWidgetTypes}
        />
    }

    return <CustomizationContext.Provider value={{ customFields: props.customFields }}>
        {fileUploadPopup && <FileUploadPopup />}
        {layout}
    </CustomizationContext.Provider>
}

function mapStateToProps(store: Store) {
    return {
        widgets: store.view.widgets
    }
}

export default connect(mapStateToProps)(View)
