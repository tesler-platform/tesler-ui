/*
 * TESLER-UI
 * Copyright (C) 2018-2021 Tesler Contributors
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

import {WidgetMeta} from '../interfaces/widget'
import {BcMetaState} from '../interfaces/bc'

/**
 * Find all widgets referencing or descendant from specified origin BC
 *
 * @param originBcName Origin business component name
 * @param widgets Widgets to search through
 * @param bcMap Business components dictionary
 * @returns A dictionary of business components and widgets
 */
export function getBcChildren(
    originBcName: string,
    widgets: WidgetMeta[],
    bcMap: Record<string, BcMetaState>
) {
    // Build a dictionary with children for requested BC and widgets that need this BC
    const childrenBcMap: Record<string, string[]> = {}
    widgets
    .filter(widget => widget.bcName)
    .forEach(widget => {
        const widgetBcList: string[] = []
        // Find all BC ancestors for widget
        widgetBcList.push(widget.bcName)
        let parentName = bcMap[widget.bcName].parentName
        while (parentName) {
            widgetBcList.push(parentName)
            parentName = bcMap[parentName].parentName
        }
        // Put all widgets referencing this BC ancestors in dictionary
        widgetBcList
        .filter(expectedBcName => bcMap[expectedBcName].parentName === originBcName)
        .forEach(expectedBcName => {
            childrenBcMap[expectedBcName] = [ ...(childrenBcMap[expectedBcName] || []), widget.name ]
        })
    })
    // If widget supports hierarchy, try to find origin BC in hierarchy options
    widgets.filter(item => item.options?.hierarchy).forEach(widget => {
        const [hierarchyBcName, hierarchyWidgetName] = getHierarchyChildBc(originBcName, widget)
        if (hierarchyBcName) {
            childrenBcMap[hierarchyBcName] = [ ...(childrenBcMap[hierarchyBcName] || []), hierarchyWidgetName ]
        }
    })

    return childrenBcMap
}

/**
 * Find child bc for hierarchy widget
 *
 * @param originBcName Origin business component name
 * @param hierarchyWidget Hierarchy widget
 */
function getHierarchyChildBc(originBcName: string, hierarchyWidget: WidgetMeta) {
    const nestedBcNames = hierarchyWidget.options.hierarchy.map(nestedItem => nestedItem.bcName)
    if (originBcName !== hierarchyWidget.bcName && !nestedBcNames.includes(originBcName)) {
        return []
    }
    const childHierarchyBcIndex = nestedBcNames.findIndex(item => item === originBcName)
    const childHierarchyBcName = nestedBcNames[childHierarchyBcIndex + 1]
    return [childHierarchyBcName, hierarchyWidget.name]
}
