import React, { useCallback, useEffect } from 'react'
import { useBcProps, useWidgetProps } from '../core'
import { useDispatch, useSelector } from 'react-redux'
import { $do } from '../../actions/actions'
import { getFilterType, parseFilters } from '../../utils/filters'
import { Store } from '../../interfaces/store'
import { WidgetField, WidgetListField } from '../../interfaces/widget'
import { BcFilter, FilterType } from '../../interfaces/filters'
import { FieldType } from '@tesler-ui/schema'

function useFilterGroupName({ filtersExist }: any) {
    const [filterGroupName, setFilterGroupName] = React.useState(null)

    useEffect(() => {
        if (!filtersExist) {
            setFilterGroupName(null)
        }
    }, [filtersExist])

    return { filterGroupName, setFilterGroupName }
}

/**
 * TODO DESCRIPTION
 * TODO ENG
 *
 * @param widgetName
 */
export function useFilters(widgetName: string) {
    const { bcName } = useWidgetProps(widgetName)
    const { cursor, filters, bc, bcPath } = useBcProps({ bcName })

    const limitBySelf = cursor ? bcPath?.includes(`${bcName}/${cursor}`) : false
    const filtersExist = !!filters?.length
    const filterGroups = bc?.filterGroups
    const filterGroupsExist = !!filterGroups?.length

    const { setFilterGroupName, filterGroupName } = useFilterGroupName({ filtersExist })

    const dispatch = useDispatch()

    const showAll = React.useCallback(() => {
        dispatch($do.showAllTableRecordsInit({ bcName, cursor }))
    }, [bcName, cursor, dispatch])

    const removeFilters = React.useCallback(() => {
        dispatch($do.bcRemoveAllFilters({ bcName }))
        dispatch($do.bcForceUpdate({ bcName }))
    }, [dispatch, bcName])

    const addFilters = React.useMemo(() => {
        return (value: string) => {
            const filterGroup = filterGroups.find(item => item.name === value)
            const parsedFilters = parseFilters(filterGroup.filters)
            setFilterGroupName(filterGroup.name)
            dispatch($do.bcRemoveAllFilters({ bcName }))
            parsedFilters.forEach(filter => dispatch($do.bcAddFilter({ bcName, filter, widgetName })))
            dispatch($do.bcForceUpdate({ bcName }))
        }
    }, [filterGroups, setFilterGroupName, dispatch, bcName, widgetName])

    return {
        limitBySelf,
        filterGroupName,
        filterGroups,
        filterGroupsExist,
        filtersExist,
        showAll,
        removeFilters,
        addFilters
    }
}

interface FilterProps {
    widgetName: string
    fieldKey: string
}

/**
 * TODO ENG
 * Хук для добавления фильтра для конкретного поля
 *
 * @param widgetName
 * @param fieldKey
 */
export function useFilter({ widgetName, fieldKey }: FilterProps) {
    const viewName = useSelector((store: Store) => store.view.name)
    const { bcName, widget } = useWidgetProps(widgetName)
    const { filters } = useBcProps({ bcName })
    const filter = filters?.find(item => item.fieldName === fieldKey)
    const widgetField = (widget?.fields as WidgetField[])?.find(item => item.key === fieldKey)
    const effectiveWidgetField = (widget?.fields?.find((item: WidgetListField) => item.key === widgetField.filterBy) ??
        widgetField) as WidgetListField

    const [localValue, setLocalValue] = React.useState(filter?.value)

    React.useEffect(() => {
        setLocalValue(filter?.value)
    }, [filter?.value])

    const dispatch = useDispatch()

    const apply = useCallback(() => {
        const newFilter: BcFilter = {
            type:
                widget.options?.filterDateByRange &&
                [FieldType.date, FieldType.dateTime, FieldType.dateTimeWithSeconds].includes(effectiveWidgetField.type)
                    ? FilterType.range
                    : getFilterType(effectiveWidgetField.type),
            value: localValue,
            fieldName: fieldKey,
            viewName,
            widgetName
        }

        if (localValue === null || localValue === undefined) {
            dispatch($do.bcRemoveFilter({ bcName, filter }))
        } else {
            dispatch($do.bcAddFilter({ bcName, filter: newFilter, widgetName }))
        }

        // FullHierarchy has its own implementation of data search without backend query filtered data
        if (!widget.options?.hierarchyFull) {
            dispatch($do.bcForceUpdate({ bcName }))
        }
    }, [
        bcName,
        dispatch,
        effectiveWidgetField.type,
        fieldKey,
        filter,
        localValue,
        viewName,
        widget.options?.filterDateByRange,
        widget.options?.hierarchyFull,
        widgetName
    ])

    const cancel = useCallback(() => {
        if (filter) {
            dispatch($do.bcRemoveFilter({ bcName: bcName, filter }))

            if (!widget.options?.hierarchyFull) {
                dispatch($do.bcForceUpdate({ bcName: bcName }))
            }
        }
        setLocalValue(undefined)
    }, [bcName, dispatch, filter, widget.options?.hierarchyFull])

    const changeValue = useCallback((value?: typeof localValue) => {
        setLocalValue(value)
    }, [])

    return {
        widget,
        filter,
        widgetField: effectiveWidgetField,
        hiddenFilter: !effectiveWidgetField,
        applyFilter: apply,
        cancelFilter: cancel,
        value: localValue,
        changeValue
    }
}
