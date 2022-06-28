import { createSelector } from 'reselect'
import { Store } from '../interfaces'
import { DataItem } from '../interfaces/data'
import { buildBcUrl } from '../utils/strings'
import {
    selectBc,
    selectBcData,
    selectBcFilters,
    selectBcHandledForceActive,
    selectBcMetaInProgress,
    selectBcPendingDataChanges,
    selectBcRowMeta,
    selectBcSorters,
    selectOldPendingValidationFails,
    selectPendingValidationFailsFormat,
    selectRouter,
    selectViewInfiniteWidgets,
    selectViewWidgets
} from './simple'
import { RowMetaSelectProps } from '../interfaces/selectors'
import { PendingValidationFails, PendingValidationFailsFormat } from '../interfaces/view'

// TODO подумать об использовании Props в название селектов
// TODO подумать об объединение rowMeta и BC. Где сделать и есть ли смысл.

const emptyData: DataItem[] = []

export const makeSelectDataProps = () =>
    createSelector([selectBc, selectBcData], (bc, bcData) => {
        const loading = bc?.loading
        const cursor = bc?.cursor

        return {
            data: loading ? emptyData : bcData,
            cursor,
            loading
        }
    })

const getBuildBcUrl = <S extends Store>(state: S, { bcName, includeSelf = true }: RowMetaSelectProps) =>
    buildBcUrl(bcName, includeSelf, state)

export const makeSelectRowMetaProps = () =>
    createSelector([selectBcRowMeta, selectBcMetaInProgress, getBuildBcUrl], (bcRowMeta, bcMetaInProgress, bcUrl) => {
        const currentRowMeta = bcRowMeta?.[bcUrl]

        return {
            rowMeta: currentRowMeta,
            rowMetaFields: currentRowMeta?.fields,
            rowMetaActions: currentRowMeta?.actions,
            rowMetaErrors: currentRowMeta?.errors,
            metaInProgress: bcMetaInProgress
        }
    })

export const makeSelectPendingDataProps = () =>
    createSelector(
        [
            selectBc,
            selectBcPendingDataChanges,
            selectPendingValidationFailsFormat,
            selectOldPendingValidationFails,
            selectBcHandledForceActive
        ],
        (bc, bcPendingDataChanges, pendingValidationFailsFormat, oldPendingValidationFails, bcHandledForceActive) => {
            const currentCursor = bc?.cursor
            const currentBcName = bc?.name
            const isTargetFailsFormat = pendingValidationFailsFormat === PendingValidationFailsFormat.target
            const currentPendingValidationFails = isTargetFailsFormat
                ? (oldPendingValidationFails as PendingValidationFails)?.[currentBcName]?.[currentCursor]
                : oldPendingValidationFails

            return {
                isTargetFailsFormat,
                currentPendingChange: bcPendingDataChanges?.[currentCursor],
                pendingValidationFailsFormat,
                currentPendingValidationFails,
                handledForceActive: bcHandledForceActive?.[currentCursor]
            }
        }
    )

export const makeSelectBcProps = () =>
    createSelector([selectBc, selectBcFilters, selectBcSorters, selectRouter], (bc, filters, sorters, router) => {
        const loading = bc?.loading
        const cursor = bc?.cursor
        const hasNext = bc?.hasNext
        const page = bc?.page
        const bcName = bc?.name

        return {
            loading,
            cursor,
            hasNext,
            page,
            bcName,
            bc,
            filters,
            sorters,
            bcPath: router.bcPath
        }
    })

export const makeSelectWidgetProps = () =>
    createSelector(
        [selectViewWidgets, selectViewInfiniteWidgets, (_: Store, widgetName: string) => widgetName],
        (widgets, infiniteWidgets, widgetName) => {
            const widget = widgets?.find(item => item.name === widgetName)
            const isInfiniteWidgets = infiniteWidgets?.includes(widgetName)

            return {
                bcName: widget?.bcName,
                widget,
                isInfiniteWidgets
            }
        }
    )

export const selectorsFactory = {
    dataProps: makeSelectDataProps,
    rowMetaProps: makeSelectRowMetaProps,
    bcProps: makeSelectBcProps,
    widgetProps: makeSelectWidgetProps,
    pendingProps: makeSelectPendingDataProps
}
