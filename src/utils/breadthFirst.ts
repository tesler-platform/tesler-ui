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

/**
 * Search node matching the predicate on the current depth prior to moving to the next depth level
 *
 * @param root Tree root
 * @param predicate Search condition for the target tree node
 * @returns Matching node and a tree depth where this node was found
 */
export function breadthFirstSearch<T extends TreeNode>(
    root: T,
    predicate: (current: TreeNode | any) => boolean,
    depth = 1
): BreadthFirstResult<T> {
    // Check the root if we can stop searching
    const rootMatch = predicate(root) && root
    if (!rootMatch && !root.child) {
        return null
    }
    if (rootMatch) {
        return { node: rootMatch, depth }
    }
    // Check all nodes on current depth
    let simpleLeaf = root.child
    .filter(item => !item.child)
    .find(item => predicate(item))
    if (simpleLeaf) {
        return { node: simpleLeaf as T, depth: depth + 1 }
    }
    // Move to the next depth
    let resultDepth = depth
    root.child
        .some(item => {
            const search = breadthFirstSearch(item, predicate, resultDepth + 1)
            simpleLeaf = search?.node
            resultDepth = search?.depth
            return search?.node
        })
    return simpleLeaf ? { node: simpleLeaf as T, depth: resultDepth } : null
}

/**
 * Breadth-first tree node
 */
export type TreeNode = { child?: TreeNode[] } & Record<any, any>

/**
 * Bredth-first search result
 */
export interface BreadthFirstResult<T> {
    /**
     * Matching node
     */
    node: T,
    /**
     * Tree depth where this node was found
     */
    depth: number
}
