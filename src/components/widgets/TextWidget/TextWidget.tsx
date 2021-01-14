import React from 'react'
import { WidgetTextMeta } from 'interfaces/widget'
import styles from './TextWidget.less'
import marked from 'marked'
import parse from 'html-react-parser'
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary'

interface TextWidgetOwnProps {
    meta: WidgetTextMeta
}

/**
 *
 * @param props
 * @category Widgets
 */
const TextWidget: React.FunctionComponent<TextWidgetOwnProps> = props => {
    const description = props.meta.description
    const htmlText = parse(marked(description))
    return (
        <ErrorBoundary msg={<p className={styles.errorMessage}>Unvalid text</p>}>
            <div className={styles.textWidget}>{htmlText}</div>
        </ErrorBoundary>
    )
}

/**
 * @category Widgets
 */
export default TextWidget
