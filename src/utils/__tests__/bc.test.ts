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

import { getBcChildren } from '../bc'
import { WidgetTypes, WidgetTableMeta } from '../../interfaces/widget'

describe('requestBcChildren', () => {
    it('returns all direct children for specified bc and all descendant widgets', () => {
        expect(getBcChildren('bcExample-1', widgets, bcMap)).toEqual(
            expect.objectContaining({
                'bcExample-1-1': ['widget-example-1-1-1', 'widget-example-1-1-2', 'widget-example-1-1-3', 'widget-example-1-1'],
                'bcExample-1-2': ['widget-example-1-2-1', 'widget-example-1-2']
            })
        )
    })

    it('handles hierarchy widgets', () => {
        expect(
            getBcChildren('bcHierarchy-1', [getHierarchyWidget(), { ...getHierarchyWidget(), bcName: 'bcHierarchy-0' }], bcHierarchyMap)
        ).toEqual(
            expect.objectContaining({
                'bcHierarchy-2': ['widget-hierarchy']
            })
        )
        expect(getBcChildren('bcHierarchy-2', [getHierarchyWidget()], bcHierarchyMap)).toEqual(
            expect.objectContaining({
                'bcHierarchy-3': ['widget-hierarchy']
            })
        )
    })

    it('handles weird case when first level of hierarchy does not specifies bc', () => {
        expect(getBcChildren('bcHierarchy-1', [getHierarchyWidget(true)], bcHierarchyMap)).toEqual({})
    })

    it('handles case when hierarchy level references BC used by non-hierarchy widget', () => {
        const sameWidgets = [{ ...getWidgetMeta(), name: 'widget-example-same', bcName: 'bcHierarchy-2' }, getHierarchyWidget()]
        const sameMap = {
            ...bcHierarchyMap,
            'bcHierarchy-2': {
                ...bcExample,
                name: 'bcHierarchy-2',
                parentName: 'bcHierarchy-1',
                url: 'bcHierarchy-2/:id'
            }
        }
        expect(getBcChildren('bcHierarchy-1', sameWidgets, sameMap)).toEqual(
            expect.objectContaining({
                'bcHierarchy-2': ['widget-example-same', 'widget-hierarchy']
            })
        )
    })
})

function getWidgetMeta(): WidgetTableMeta {
    return {
        name: 'widget-example',
        type: WidgetTypes.List,
        title: null,
        bcName: 'bcExample',
        position: 1,
        gridWidth: null,
        fields: []
    }
}

const widgets: WidgetTableMeta[] = [
    { ...getWidgetMeta(), name: 'widget-example-1-1-1', bcName: 'bcExample-1-1-1' },
    { ...getWidgetMeta(), name: 'widget-example-1-1-2', bcName: 'bcExample-1-1-2' },
    { ...getWidgetMeta(), name: 'widget-example-1-1-3', bcName: 'bcExample-1-1-3' },
    { ...getWidgetMeta(), name: 'widget-example-1-2-1', bcName: 'bcExample-1-2-1' },
    { ...getWidgetMeta(), name: 'widget-example-1-1', bcName: 'bcExample-1-1' },
    { ...getWidgetMeta(), name: 'widget-example-1-2', bcName: 'bcExample-1-2' },
    { ...getWidgetMeta(), name: 'widget-example-1', bcName: 'bcExample-1' },
    { ...getWidgetMeta(), name: 'widget-example-2', bcName: 'bcExample-2' },
    { ...getWidgetMeta(), name: 'widget-example-2-1', bcName: 'bcExample-2-1' }
]

function getHierarchyWidget(missingBc?: boolean): WidgetTableMeta {
    return {
        ...getWidgetMeta(),
        name: 'widget-hierarchy',
        bcName: 'bcHierarchy-1',
        options: {
            hierarchy: [
                { bcName: missingBc ? null : 'bcHierarchy-2', fields: [] },
                { bcName: 'bcHierarchy-3', fields: [] },
                { bcName: 'bcHierarchy-4', fields: [] }
            ]
        }
    }
}

const bcExample = {
    name: 'bcExample',
    parentName: null as string,
    url: 'bcExample/:id',
    cursor: '1',
    page: 2,
    limit: 5,
    loading: false
}

const bcMap = {
    'bcExample-1-1-1': {
        ...bcExample,
        name: 'bcExample-1-1-1',
        parentName: 'bcExample-1-1',
        url: 'bcExample-1/:id/bcExample-1-1/:id/bcExample-1-1-1/:id'
    },
    'bcExample-1-1-2': {
        ...bcExample,
        name: 'bcExample-1-1-2',
        parentName: 'bcExample-1-1',
        url: 'bcExample-1/:id/bcExample-1-1/:id/bcExample-1-1-2/:id'
    },
    'bcExample-1-1-3': {
        ...bcExample,
        name: 'bcExample-1-1-3',
        parentName: 'bcExample-1-1',
        url: 'bcExample-1/:id/bcExample-1-1/:id/bcExample-1-1-3/:id'
    },
    'bcExample-1-1': {
        ...bcExample,
        name: 'bcExample-1-1',
        parentName: 'bcExample-1',
        url: 'bcExample-1/:id/bcExample-1-1/:id'
    },
    'bcExample-1-2': {
        ...bcExample,
        name: 'bcExample-1-2',
        parentName: 'bcExample-1',
        url: 'bcExample-1/:id/bcExample-1-2/:id'
    },
    'bcExample-1-2-1': {
        ...bcExample,
        name: 'bcExample-1-2-1',
        parentName: 'bcExample-1-2',
        url: 'bcExample-1/:id/bcExample-1-2/:id/bcExample-1-2-1/:id'
    },
    'bcExample-1': {
        ...bcExample,
        name: 'bcExample-1',
        url: 'bcExample-1/:id'
    },
    'bcExample-2': {
        ...bcExample,
        name: 'bcExample-2',
        url: 'bcExample-2/:id'
    },
    'bcExample-2-1': {
        ...bcExample,
        name: 'bcExample-2-1',
        parentName: 'bcExample-2',
        url: 'bcExample-2/:id/bcExample-2-1/:id'
    }
}

const bcHierarchyMap = {
    'bcHierarchy-0': {
        ...bcExample,
        name: 'bcHierarchy-0',
        url: 'bcHierarchy-0/:id'
    },
    'bcHierarchy-1': {
        ...bcExample,
        name: 'bcHierarchy-1',
        url: 'bcHierarchy-1/:id'
    }
}
