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

import {WidgetTableMeta, WidgetMeta} from '../interfaces/widget'
import {BcMetaState} from '../interfaces/bc'

/**
 * Find all widgets referencing or descendant from specified origin BC
 *
 * @param originBcName Parent business component name
 * @param widgets Widgets to search through
 * @param bcMap Business components dictionary
 * @returns A dictionary of business components and widgets
 */
export function requestBcChildren(
    originBcName: string,
    widgets: WidgetMeta[],
    bcMap: Record<string, BcMetaState>
) {
    // Build a dictionary with children for requested BC and widgets that need this BC
    const childrenBcMap: Record<string, string[]> = {}
    widgets.forEach(widget => {
        if (widget.bcName) {
            const widgetBcList: string[] = []

            widgetBcList.push(widget.bcName)
            let parentName = bcMap[widget.bcName]?.parentName
            while (parentName) {
                widgetBcList.push(parentName)
                parentName = bcMap[parentName]?.parentName
            }

            widgetBcList.some((expectedBcName) => {
                if (bcMap[expectedBcName].parentName === originBcName) {
                    if (!childrenBcMap[expectedBcName]) {
                        childrenBcMap[expectedBcName] = []
                    }
                    childrenBcMap[expectedBcName].push(widget.name)
                    return true
                }

                return false
            })
        }
    })

    // If widgets supports hierarchy, try to find children though it
    // TODO: need description and split to separate methods?
    const hierarchyWidget = widgets.find(item => {
        const hierarchy = item.options?.hierarchy
        const nestedBc = hierarchy?.map(nestedItem => nestedItem.bcName)
        return hierarchy && (item.bcName === originBcName || nestedBc.includes(originBcName))
    }) as WidgetTableMeta
    if (hierarchyWidget) {
        const nestedBcNames = hierarchyWidget.options?.hierarchy.map(nestedItem => nestedItem.bcName)
        const childHierarchyBcIndex = nestedBcNames.findIndex(item => item === originBcName)
        const childHierarchyBcName = childHierarchyBcIndex !== -1
            ? nestedBcNames[childHierarchyBcIndex + 1]
            : hierarchyWidget.options?.hierarchy[0].bcName
        if (!childHierarchyBcName) {
            return childrenBcMap
        }
        if (!childrenBcMap[childHierarchyBcName]) {
            childrenBcMap[childHierarchyBcName] = []
        }
        childrenBcMap[childHierarchyBcName].push(hierarchyWidget.name)
    }
    return childrenBcMap
}
