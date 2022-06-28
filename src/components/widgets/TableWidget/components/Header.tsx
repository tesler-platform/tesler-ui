import React, { useCallback, useEffect } from 'react'
import * as styles from '../TableWidget.less'
import Select from '../../../ui/Select/Select'
import ActionLink from '../../../ui/ActionLink/ActionLink'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Store } from '../../../../interfaces/store'
import { parseFilters } from '../../../../utils/filters'
import { $do } from '../../../../actions/actions'

export interface HeaderProps {
    bcName: string
    widgetName: string
}

function Header({ bcName, widgetName }: HeaderProps) {
    const { t } = useTranslation()
    const [filterGroupName, setFilterGroupName] = React.useState(null)

    const { filtersExist, limitBySelf, filterGroups, cursor } = useSelector((store: Store) => {
        const bc = store.screen.bo.bc[bcName]
        const bcCursor = bc?.cursor
        const filters = store.screen.filters[bcName]

        return {
            filtersExist: !!filters?.length,
            limitBySelf: bcCursor && store.router.bcPath?.includes(`${bcName}/${bcCursor}`),
            filterGroups: bc?.filterGroups,
            cursor: bcCursor
        }
    })

    useEffect(() => {
        if (!filtersExist) {
            setFilterGroupName(null)
        }
    }, [filtersExist])

    const dispatch = useDispatch()

    const handleAddFilters = useCallback(
        (value: string) => {
            const filterGroup = filterGroups.find(item => item.name === value)
            const parsedFilters = parseFilters(filterGroup.filters)

            setFilterGroupName(filterGroup.name)

            dispatch($do.bcRemoveAllFilters({ bcName }))
            parsedFilters.forEach(item => dispatch($do.bcAddFilter({ bcName, filter: item, widgetName })))
            dispatch($do.bcForceUpdate({ bcName }))
        },
        [filterGroups, dispatch, bcName, widgetName]
    )

    const handleRemoveFilters = useCallback(() => {
        dispatch($do.bcRemoveAllFilters({ bcName }))
        dispatch($do.bcForceUpdate({ bcName }))
    }, [dispatch, bcName])

    const handleShowAll = React.useCallback(() => {
        // TODO: Remove `route` in 2.0 as it is accessible from the store; remove `bcName`
        dispatch($do.showAllTableRecordsInit({ bcName, cursor }))
    }, [dispatch, bcName, cursor])

    return (
        <div>
            <div className={styles.filtersContainer}>
                {!!filterGroups?.length && (
                    <Select
                        value={filterGroupName ?? t('Show all').toString()}
                        onChange={handleAddFilters}
                        dropdownMatchSelectWidth={false}
                    >
                        {filterGroups.map(group => (
                            <Select.Option key={group.name} value={group.name}>
                                <span>{group.name}</span>
                            </Select.Option>
                        ))}
                    </Select>
                )}
                {filtersExist && <ActionLink onClick={handleRemoveFilters}> {t('Clear all filters')} </ActionLink>}
                {limitBySelf && <ActionLink onClick={handleShowAll}> {t('Show all records')} </ActionLink>}
            </div>
        </div>
    )
}

export default React.memo(Header)
