import React from 'react'
import {PaginationMode} from '../../../interfaces/widget'
import {Button} from 'antd'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import {Store} from '../../../interfaces/store'
import styles from './Pagination.less'
import {$do} from '../../../actions/actions'

interface PaginationOwnProps {
    bcName: string,
    widgetName?: string,
    mode: PaginationMode,
    onChangePage?: () => void,
}

interface PaginationStateProps {
    hasNext: boolean,
    page: number,
    loading: boolean,
    widgetName: string
}

interface PaginationDispatchProps {
    changePage: (bcName: string, page: number) => void,
    loadMore: (bcName: string, widgetName: string) => void,
}

type PaginationAllProps = PaginationOwnProps & PaginationStateProps & PaginationDispatchProps

const Pagination: React.FunctionComponent<PaginationAllProps> = (props) => {
    // disable pagination if not required
    if (!props.hasNext && props.page < 2) {
        return null
    }
    const onLoadMore = React.useCallback(
        () => {
            props.loadMore(props.bcName, props.widgetName)
        },
        [props.bcName, props.widgetName, props.loadMore]
    )

    const onPrevPage = React.useCallback(
        () => {
            props.changePage(props.bcName, props.page - 1)
            if (props.onChangePage) {
                props.onChangePage()
            }
        },
        [props.bcName, props.page, props.changePage]
    )

    const onNextPage = React.useCallback(
        () => {
            props.changePage(props.bcName, props.page + 1)
            if (props.onChangePage) {
                props.onChangePage()
            }
        },
        [props.bcName, props.page, props.changePage]
    )

    if (props.mode === PaginationMode.page) {
        return <div className={styles.paginationContainer}>
            <Button
                className={styles.prevButton}
                disabled={props.page < 2}
                onClick={onPrevPage}
                icon="left"
            />
            <Button
                disabled={!props.hasNext}
                onClick={onNextPage}
                icon="right"
            />
        </div>
    } else {
        return (props.hasNext)
            ? <div className={styles.paginationContainer}>
                <Button
                    onClick={onLoadMore}
                    disabled={props.loading}
                    loading={props.loading}
                >
                    Загрузить ещё
                </Button>
            </div>
            : null
    }
}

function mapStateToProps(store: Store, ownProps: PaginationOwnProps): PaginationStateProps {
    const bc = store.screen.bo.bc[ownProps.bcName]
    return {
        hasNext: bc?.hasNext,
        page: bc?.page,
        loading: bc?.loading,
        widgetName: ownProps.widgetName
    }
}

function mapDispatchToProps(dispatch: Dispatch): PaginationDispatchProps {
    return {
        changePage: (bcName: string, page: number) => {
            dispatch($do.bcChangePage({bcName, page}))
        },
        loadMore: (bcName: string, widgetName: string) => {
            dispatch($do.bcLoadMore({bcName: bcName, widgetName: widgetName}))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Pagination)
