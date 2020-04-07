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
import {MenuItem, ViewNavigationCategory, ViewNavigationGroup, isViewNavigationItem} from '../../interfaces/navigation'
import {breadthFirstSearch} from '../breadthFirst'
import * as navigationSample from './__mocks__/navigation.json'

const sample = navigationSample.menu

describe('breadthFirstSearch', () => {
    const firstAvailablePredicate = (node: Exclude<MenuItem, ViewNavigationCategory>) => {
        return isViewNavigationItem(node)
    }
    const defaultViewPredicate = (defaultView: string) => (node: Exclude<MenuItem, ViewNavigationCategory>) => {
        if (isViewNavigationItem(node)) {
            return node.viewName === defaultView
        }
        return false
    }
    it('should find first available view', () => {
        expect(breadthFirstSearch(sample[1] as ViewNavigationGroup, firstAvailablePredicate)?.node).toMatchObject({
            viewName: 'viewB1'
        })
        expect(breadthFirstSearch(sample[2] as ViewNavigationGroup, firstAvailablePredicate)?.node).toMatchObject({
            viewName: 'viewC_1_2'
        })
    })
    it('should find specified default view', () => {
        expect(breadthFirstSearch(sample[1] as ViewNavigationGroup, defaultViewPredicate('viewB1'))?.node).toMatchObject({
            viewName: 'viewB1'
        })
        expect(breadthFirstSearch(sample[2] as ViewNavigationGroup, defaultViewPredicate('viewC_1_2'))?.node).toMatchObject({
            viewName: 'viewC_1_2'
        })
        expect(breadthFirstSearch(sample[2] as ViewNavigationGroup, defaultViewPredicate('viewC_2_2'))?.node).toMatchObject({
            viewName: 'viewC_2_2'
        })
    })
    it('should return the depth where node was found', () => {
        expect(breadthFirstSearch(sample[0] as ViewNavigationGroup, defaultViewPredicate('viewA'))?.depth).toBe(1)
        expect(breadthFirstSearch(sample[1] as ViewNavigationGroup, defaultViewPredicate('viewB1'))?.depth).toBe(2)
        expect(breadthFirstSearch(sample[2] as ViewNavigationGroup, defaultViewPredicate('viewC_1_2'))?.depth).toBe(2)
        expect(breadthFirstSearch(sample[2] as ViewNavigationGroup, defaultViewPredicate('viewC_2_1'))?.depth).toBe(3)
        expect(breadthFirstSearch(sample[3] as ViewNavigationGroup, defaultViewPredicate('viewD1'))?.depth).toBe(4)
    })
})
