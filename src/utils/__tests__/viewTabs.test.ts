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
import {getViewTabs, getReferencedView} from '../viewTabs'
import {ViewNavigationGroup} from '../../interfaces/navigation'
import * as navigationSample from './__mocks__/navigation.json'
import * as navigationFlatSample from './__mocks__/navigationFlat.json'

const sample = navigationSample.menu
const sampleFlat = navigationFlatSample.menu

describe('useNavigation helper', () => {
    it('should form 1 level menu', () => {
        expect(getViewTabs(sample, 1)).toMatchObject([
            { viewName: 'viewA' },
            { viewName: 'viewB2', title: 'categoryB' },
            { viewName: 'viewC_1_2', title: 'categoryC' },
            { viewName: 'viewD1', title: 'categoryD' }
        ])
    })
    it('should form 2 level menu', () => {
        expect(getViewTabs(sample, 2, 'viewB1')).toMatchObject([
            { viewName: 'viewB1' },
            { viewName: 'viewB2' }
        ])
        expect(getViewTabs(sample, 2, 'viewB2')).toMatchObject([
            { viewName: 'viewB1' },
            { viewName: 'viewB2' }
        ])
        expect(getViewTabs(sample, 2, 'viewC_1_2')).toMatchObject([
            { viewName: 'viewC_2_2' },
            { viewName: 'viewC_1_2' }
        ])
    })
    it('should form 3 level menu', () => {
        expect(getViewTabs(sample, 3, 'viewC_2_1')).toMatchObject([
            { viewName: 'viewC_2_1' },
            { viewName: 'viewC_2_2' }
        ])
    })
    it('should form 4 level menu', () => {
        expect(getViewTabs(sample, 4, 'viewD1')).toMatchObject([
            { viewName: 'viewD1' },
            { viewName: 'viewD2' }
        ])
    })
    it('should work with flat navigation', () => {
        expect(getViewTabs(sampleFlat, 1, 'banklist')).toMatchObject([
            { viewName: 'banklist' },
            { viewName: 'bankcard' }
        ])
    })
    it('should not break when requesting non existing tab level', () => {
        expect(getViewTabs(sampleFlat, 2, 'twilightSparkle')).toMatchObject([])
    })
})

describe('getReferencedView', () => {
    it('should return default category view when specified', () => {
        expect(getReferencedView(sample[1]))
        .toMatch((sample[1] as ViewNavigationGroup).defaultView)
        expect(getReferencedView((sample[2] as ViewNavigationGroup).child[0]))
        .toMatch(((sample[2] as ViewNavigationGroup).child[0] as ViewNavigationGroup).defaultView)
    }),
    it('should return first available view when not specified', () => {
        expect(getReferencedView(sample[0])).toMatch('viewA')
        expect(getReferencedView(sample[2])).toMatch('viewC_1_2')
    })
})
