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

import { DataItem } from './data'
import { AssociatedItem } from './operation'

export interface BaseDataNode {
    /**
     * Uniquely identifies record
     */
    id: string
}

/**
 * Types for Tree-like structures (tree traversal, search, etc)
 */

/**
 * Base type for tree-like structures in flat array form
 */
export interface DataNode extends BaseDataNode {
    /**
     * String reference to a parent node
     */
    parentId: string
    /**
     * The depth of the node counting from the root of the tree
     */
    level?: number
}

/**
 * Tesler-specific data item that classifies as tree node
 */
export type DataItemNode = DataNode & DataItem

/**
 * Base type for tree nodes that keep references to parent nodes
 */
export interface TreeNodeAscending extends DataNode {
    /**
     * Reference to parent node
     */
    parent: TreeNodeAscending
}

/**
 * Base type for tree nodes that keep references to children nodes
 */
export interface TreeNodeDescending extends BaseDataNode {
    /**
     * An array of references to children nodes
     */
    children?: TreeNodeDescending[]
}

/**
 * Base type for tree nodes that keep references both to the parent and children nodes
 */
export interface TreeNodeBidirectional extends DataNode {
    /**
     * Reference to the parent
     */
    parent: TreeNodeBidirectional
    /**
     * An array of children
     */
    children?: TreeNodeBidirectional[]
}

export type TreeAssociatedRecord = DataNode & AssociatedItem

/**
 * Tree node that keeps a status if it is expanded (i.e. children also should be displayed)
 */
export type TreeNodeCollapsable<T extends TreeNodeBidirectional = TreeNodeBidirectional> = T & { _expanded: boolean }
