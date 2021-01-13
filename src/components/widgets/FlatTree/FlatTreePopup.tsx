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

import React, { ComponentType } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { ListChildComponentProps } from 'react-window'
import { WidgetTableMeta } from '../../../interfaces/widget'
import { FlatTree } from './FlatTree'
import PickListPopup from '../PickListPopup/PickListPopup'
import { Store } from '../../../interfaces/store'
import { $do } from '../../../actions/actions'
import { PopupFooter } from '../../../components/ui/Popup/PopupFooter'
import { useSingleSelect } from './useSingleSelect'
import { useMultipleSelect } from './useMultipleSelect'

/**
 * Properties for `FlatTreePopup` widget
 */
export interface FlatTreePopupProps {
    /**
     * Widget configuration
     */
    meta: WidgetTableMeta
    /**
     * Customization of items renderer
     */
    children?: ComponentType<ListChildComponentProps>
}

/**
 * Popup widget dislaying tree-like data with items expandable into nested subtrees as
 * flat virtualized list of items.
 *
 * Data must be presorted (every parent is followed by its descendants) for this widget.
 *
 * @param props Widget props
 */
export const FlatTreePopup: React.FC<FlatTreePopupProps> = props => {
    const { multiple, hierarchyGroupSelection, hierarchyGroupDeselection, hierarchyRadioAll, hierarchyRadio: hierarchyRootRadio } =
        props.meta.options ?? {}

    const bcName = props.meta.bcName
    const dispatch = useDispatch()

    const { parentBcName, parentCursor } = useSelector((store: Store) => {
        const parentName = store.screen.bo.bc[props.meta.bcName].parentName
        const parentBc = store.screen.bo.bc[parentName]
        return {
            parentBcName: parentName,
            parentCursor: parentBc.cursor
        }
    }, shallowEqual)

    const pickListDescriptor = useSelector((store: Store) => {
        return store.view.pickMap
    }, shallowEqual)

    const handleSingleSelect = useSingleSelect(pickListDescriptor, bcName, parentCursor, parentBcName)
    const handleMultipleSelect = useMultipleSelect(
        bcName,
        hierarchyGroupSelection,
        hierarchyGroupDeselection,
        hierarchyRadioAll,
        hierarchyRootRadio
    )
    const handleSelect = multiple ? handleMultipleSelect : handleSingleSelect

    const handleConfirmMultiple = React.useCallback(() => {
        dispatch($do.saveAssociations({ bcNames: [bcName] }))
        dispatch($do.bcCancelPendingChanges({ bcNames: [bcName] }))
        dispatch($do.closeViewPopup({ bcName }))
    }, [bcName])

    const handleCancelMultiple = React.useCallback(() => {
        dispatch($do.closeViewPopup({ bcName }))
        dispatch($do.bcRemoveAllFilters({ bcName }))
        dispatch($do.bcCancelPendingChanges({ bcNames: [bcName] }))
    }, [bcName])

    const footer = React.useMemo(() => {
        return multiple ? <PopupFooter onAccept={handleConfirmMultiple} onCancel={handleCancelMultiple} /> : null
    }, [multiple])

    const components = React.useMemo(() => {
        return {
            table: (
                <FlatTree meta={props.meta} multiple={multiple} onSelect={handleSelect}>
                    {props.children}
                </FlatTree>
            ),
            footer
        }
    }, [props.meta, handleSelect])

    return <PickListPopup widget={props.meta} components={components} disableScroll />
}

export default React.memo(FlatTreePopup)
