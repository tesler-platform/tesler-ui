import React from 'react'
import {PaginationMode} from '../../../interfaces/widget'
import {Button} from 'antd'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import {Store} from '../../../interfaces/store'
import styles from './Pagination.less'
import {$do} from '../../../actions/actions'

interface PaginationOwnProps {
    bcName: string
    mode: PaginationMode,
}

interface PaginationStateProps {
    hasNext: boolean,
    page: number,
    loading: boolean,
}

interface PaginationDispatchProps {
    changePage: (bcName: string, page: number) => void,
    loadMore: (bcName: string) => void,
}

type PaginationAllProps = PaginationOwnProps & PaginationStateProps & PaginationDispatchProps

const Pagination: React.FunctionComponent<PaginationAllProps> = (props) => {
    // disable pagination if not required
    if (!props.hasNext && props.page < 2) {
        return null
    }
    const onLoadMore = React.useCallback(
        () => {
            props.loadMore(props.bcName)
        },
        [props.bcName, props.loadMore]
    )

    const onPrevPage = React.useCallback(
        () => {
            props.changePage(props.bcName, props.page - 1)
        },
        [props.bcName, props.page, props.changePage]
    )

    const onNextPage = React.useCallback(
        () => {
            props.changePage(props.bcName, props.page + 1)
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
        hasNext: bc && bc.hasNext,
        page: bc && bc.page,
        loading: bc && bc.loading
    }
}

function mapDispatchToProps(dispatch: Dispatch): PaginationDispatchProps {
    return {
        changePage: (bcName: string, page: number) => {
            dispatch($do.bcChangePage({bcName, page}))
        },
        loadMore: (bcName: string) => {
            dispatch($do.bcLoadMore({bcName}))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Pagination)
