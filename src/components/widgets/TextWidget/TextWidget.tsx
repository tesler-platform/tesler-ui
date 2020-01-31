import React from 'react'
import {WidgetTextMeta} from 'interfaces/widget'
import {connect} from 'react-redux'
import {Store} from '../../../interfaces/store'
import styles from './TextWidget.less'

const parse = require('html-react-parser')
const marked = require('marked')

interface TextWidgetOwnProps {
    meta: WidgetTextMeta
}

interface TextWidgetProps extends TextWidgetOwnProps {
    description: string
}

const TextWidget: React.FunctionComponent<TextWidgetProps> = (props) => {
    const description = props.description
    const htmlText = parse(marked(description))
    return <div className={styles.textWidget}>
        {htmlText}
    </div>
}

function mapStateToProps(store: Store, ownProps: TextWidgetOwnProps) {
    const description = ownProps.meta.description
    return {
        description
    }
}

export default connect(mapStateToProps)(TextWidget)
