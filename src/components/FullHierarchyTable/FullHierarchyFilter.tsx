import {Dispatch} from 'redux'
import {connect} from 'react-redux'
import {ColumnFilter, mapStateToProps} from '../ColumnTitle/ColumnFilter'
import {$do} from '../../actions/actions'
import {BcFilter} from '../../interfaces/filters'

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onApply: (bcName: string, filter: BcFilter) => {
            dispatch($do.bcAddFilter({ bcName, filter }))
        },
        onCancel: (bcName: string, filter: BcFilter) => {
            dispatch($do.bcRemoveFilter({ bcName, filter }))
        },
        onMultivalueAssocOpen: () => {dispatch($do.emptyAction(null))}
    }
}

const FullHierarchyFilter = connect(mapStateToProps, mapDispatchToProps)(ColumnFilter)
export default FullHierarchyFilter
