import React from 'react'
import {splitIntoTokens} from '../../../utils/strings'

interface SearchHighlightProps {
    source: string,
    search: string | RegExp,
    match: (substring: string) => React.ReactNode
    notMatch?: (substring: string) => React.ReactNode
}

const SearchHighlight: React.FC<SearchHighlightProps> = (props) => {
    const tokens = splitIntoTokens(props.source, props.search)
    return <>
        { tokens
            .filter(item => !!item)
            .map((item, index) => {
                const isMatch = props.search instanceof RegExp
                    ? props.search.test(item)
                    : item === props.search
                if (isMatch) {
                    return <React.Fragment key={index}>
                        {props.match(item) || item}
                    </React.Fragment>
                }
                return <React.Fragment key={index}>
                    {props.notMatch?.(item) || item}
                </React.Fragment>
            })}
    </>
}

export default React.memo(SearchHighlight)
