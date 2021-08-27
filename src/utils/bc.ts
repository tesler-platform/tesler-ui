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

import { WidgetMeta, WidgetShowCondition } from '../interfaces/widget'
import { BcMetaState } from '../interfaces/bc'
import { DataItem, PendingDataItem } from '../interfaces/data'

/**
 * Find all widgets referencing or descendant from specified origin BC
 *
 * @param originBcName Origin business component name
 * @param widgets Widgets to search through
 * @param bcMap Business components dictionary
 * @returns A dictionary of business components and widgets
 */
export function getBcChildren(originBcName: string, widgets: WidgetMeta[], bcMap: Record<string, BcMetaState>) {
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
                    childrenBcMap[expectedBcName] = [...(childrenBcMap[expectedBcName] || []), widget.name]
                })
        })
    // If widget supports hierarchy, try to find origin BC in hierarchy options
    widgets
        .filter(item => item.options?.hierarchy)
        .forEach(widget => {
            const [hierarchyBcName, hierarchyWidgetName] = getHierarchyChildBc(originBcName, widget)
            if (hierarchyBcName) {
                childrenBcMap[hierarchyBcName] = [...(childrenBcMap[hierarchyBcName] || []), hierarchyWidgetName]
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

/**
 * Check specified show condition for the widget
 *
 * Condition is true (and widget is visible) if currently active record for condition business component has a value of the specific
 * field matching the condition; pending values are also enough for the condition to be true.
 * Condition is also true when it explicitly declared as default condition, if it's empty or of the legacy array format
 *
 * Otherwise the condition is false and the widget is hidden.
 *
 * @param condition Widget showCondition to check
 * @param cursor Id of active record for business component in condition
 * @param data An array of data items to check for condition
 * @param pendingDataChanges Pending data changes of the currently active view
 */
export function checkShowCondition(
    condition: WidgetShowCondition,
    cursor: string,
    data: DataItem[],
    pendingDataChanges: Record<string, Record<string, PendingDataItem>>
) {
    const { bcName, isDefault, params } = condition || {}
    const emptyCondition = !condition || Array.isArray(condition)
    if (emptyCondition || isDefault) {
        return true
    }
    const record = cursor && data?.find(item => item.id === cursor)
    const actualValue = record?.[params.fieldKey]
    if (!actualValue) {
        return true
    }
    const pendingValue = pendingDataChanges?.[bcName]?.[cursor]?.[params.fieldKey]
    return pendingValue !== undefined ? pendingValue === params.value : actualValue === params.value
}
