import React, {FunctionComponent} from 'react'
import {connect} from 'react-redux'
import {Store} from '../../interfaces/store'
import {getFieldTitle} from '../../utils/strings'

interface TemplatedTitleOwnProps {
    title: string,
    widgetName: string,
    container?: React.ComponentType<any>
}

interface TemplatedTitleProps extends TemplatedTitleOwnProps {
    templatedTitle: string
}

export const TemplatedTitle: FunctionComponent<TemplatedTitleProps> = (props) => {
    if (!props.title) {
        return null
    }
    const wrapper = props.container && <props.container title={props.templatedTitle}/>
    return wrapper || <> {props.templatedTitle} </>
}

function mapStateToProps(store: Store, ownProps: TemplatedTitleOwnProps) {
    const widget = store.view.widgets.find(item => item.name === ownProps.widgetName)
    const bcName = widget && widget.bcName
    const bc = store.screen.bo.bc[bcName]
    const cursor = bc && bc.cursor
    const bcData = store.data[bcName]
    const dataItem = bcData && bcData.find(item => item.id === cursor)
    return {
        templatedTitle: getFieldTitle(ownProps.title, dataItem)
    }
}
export default connect(mapStateToProps)(TemplatedTitle)
