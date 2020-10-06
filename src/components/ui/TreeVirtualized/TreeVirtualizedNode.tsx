/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import {ListChildComponentProps} from 'react-window'
import {Icon, Popover} from 'antd'
import {TreeNodeBidirectional} from '../../../interfaces/tree'
import SearchHightlight from '../SearchHightlight/SearchHightlight'
import {escapedSrc} from '../../../utils/strings'
import styles from './TreeVirtualizedNode.less'
import {BcFilter} from '../../../interfaces/filters'

/**
 * Properties for `TreeVirtualizedNode` component
 *
 * @typeParam T Type of node item
 */
export interface TreeVirtualizedNodeData<T> {
    /**
     * All items that can be displayed as nodes
     */
    items: Array<T & TreeNodeBidirectional>,
    /**
     * Fields of the item that should be displayed as columns
     */
    fields: Array<keyof T>,
    /**
     * An array of ids of expanded nodes
     */
    expandedItems: string[],
    /**
     * Fields with values matching this expression will be highlighted;
     *
     * @see {@link src/utils/strings.ts#escapedSrc} for details how search expression is escaped
     */
    filters?: BcFilter[],
    /**
     * Custom renderer for matching values
     */
    searchHighlighter?: (value: string) => React.ReactNode,
    /**
     * Fires when expanding/collapsing node
     */
    onToggle: (id: string) => void,
    /**
     * Fires when selectin a node
     */
    onSelect?: (item: T) => void
}

/**
 * Overriding `react-window` node data with tree-specific properties
 */
export interface TreeVirtualizedNodeProps<T> extends ListChildComponentProps {
    data: TreeVirtualizedNodeData<T>
}

/**
 * Default implementation of node renderer for virtualized trees
 *
 * Should not be extended with new features, rather it should be overriden entirely for customizations.
 *
 * @param props Component props
 * @typeParam T Type of node item
 */
export function TreeVirtualizedNode<T extends TreeNodeBidirectional>(props: TreeVirtualizedNodeProps<T>) {
    const data = props.data
    const item = data.items[props.index]
    const expanded = data.expandedItems?.includes(item.id)
    return <div className={styles.row} style={props.style}>
        <div className={styles.controls}>
            { item.children?.length &&
                <button
                    className={styles.button}
                    onClick={() => data.onToggle(item.id)}
                >
                    <Icon
                        className={styles.icon}
                        type={expanded ? 'minus-square' : 'plus-square'}
                    />
                </button>
            }
        </div>
        { data.fields?.map(key => {
            const filter = data.filters?.find(f => f.fieldName === key)
            const content = filter
                ? <SearchHightlight
                    source={item[key] as unknown as string}
                    search={escapedSrc(filter.value as string)}
                    match={data.searchHighlighter}
                />
                : item[key]
            return <div
                key={key as string}
                className={styles.column}
                onClick={() => data.onSelect?.(item)}
            >
                <div className={styles.content}>
                    { content }
                </div>
                <div className={styles.more}>
                    <Popover content={content} placement="right">
                        <Icon type="double-right" />
                    </Popover>
                </div>
            </div>
        })}

    </div>
}

export default React.memo(TreeVirtualizedNode)
