import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Icon } from 'antd'
import { $do } from '../../actions/actions'
import { Store } from '../../interfaces/store'
import { BcSorter } from '../../interfaces/filters'
import cn from 'classnames'
import styles from './ColumnSort.less'

export interface ColumnSortOwnProps {
    className?: string
    widgetName: string
    fieldKey: string
}

export interface ColumnSortProps extends ColumnSortOwnProps {
    sorter: BcSorter
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of widget name
     */
    bcName: string
    /**
     * @deprecated TODO: Remove in 2.0.0, get page directly from the store
     */
    page: number
    infinitePagination: boolean
    onSort: (bcName: string, sorter: BcSorter, page: number, widgetName: string, infinitePagination: boolean) => void
}

export const ColumnSort: FunctionComponent<ColumnSortProps> = props => {
    if (!props.bcName) {
        return null
    }
    let icon = 'caret-down'
    if (props.sorter) {
        icon = props.sorter.direction === 'asc' ? 'caret-up' : 'caret-down'
    }

    const handleSort = () => {
        const sorter: BcSorter = {
            fieldName: props.fieldKey,
            direction: !props.sorter ? 'desc' : props.sorter.direction === 'asc' ? 'desc' : 'asc'
        }
        props.onSort(props.bcName, sorter, props.page, props.widgetName, props.infinitePagination)
    }

    return <Icon className={cn(styles.icon, props.className, { [styles.forceShow]: props.sorter })} type={icon} onClick={handleSort} />
}

function mapStateToProps(store: Store, ownProps: ColumnSortOwnProps) {
    const widget = store.view.widgets.find(item => item.name === ownProps.widgetName)
    const bcName = widget?.bcName
    const sorter = store.screen.sorters[bcName]?.find(item => item.fieldName === ownProps.fieldKey)
    const page = store.screen.bo.bc[bcName]?.page
    const infinitePagination = store.view.infiniteWidgets?.includes(ownProps.widgetName)
    return {
        bcName,
        infinitePagination,
        sorter,
        page
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onSort: (bcName: string, sorter: BcSorter, page: number, widgetName: string, infinitePagination: boolean) => {
            dispatch($do.bcAddSorter({ bcName, sorter }))
            infinitePagination
                ? dispatch(
                      $do.bcFetchDataPages({
                          bcName: bcName,
                          widgetName: widgetName,
                          from: 1,
                          to: page
                      })
                  )
                : dispatch(
                      $do.bcForceUpdate({
                          bcName: bcName,
                          widgetName: widgetName
                      })
                  )
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ColumnSort)
