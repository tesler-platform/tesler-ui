import React from 'react'
import {WidgetTextMeta} from 'interfaces/widget'
import styles from './TextWidget.less'
import marked from 'marked'
import parse from 'html-react-parser'
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary'

interface TextWidgetOwnProps {
    meta: WidgetTextMeta
}

/**
 * @deprecated TODO: remove in 2.0 as unused
 * TODO: remove 'marked' and 'html-react-parser' from package.json
 * TODO: fix `webpack.config.js` according deletions
 */
const TextWidget: React.FunctionComponent<TextWidgetOwnProps> = (props) => {
    const description = props.meta.description
    const htmlText = parse(marked(description))
    return <ErrorBoundary msg={<p className={styles.errorMessage}>Невалидный текст</p>}>
        <div className={styles.textWidget}>
            {htmlText}
        </div>
    </ErrorBoundary>
}

export default (TextWidget)
