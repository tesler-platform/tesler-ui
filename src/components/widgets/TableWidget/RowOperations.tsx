import React from 'react'
import {Dispatch} from 'redux'
import {connect} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Menu, Skeleton, Icon, Dropdown} from 'antd'
import {$do} from '../../../actions/actions'
import {useWidgetOperations} from '../../../hooks'
import {buildBcUrl} from '../../../utils/strings'
import {Operation, OperationGroup} from '../../../interfaces/operation'
import {WidgetTableMeta} from '../../../interfaces/widget'
import {Store} from '../../../interfaces/store'
import styles from './RowOperations.less'

interface RowOperationsOwnProps {
    widgetMeta: WidgetTableMeta,
    selectedKey?: string
}

interface RowOperationProps extends RowOperationsOwnProps {
    operations: Array<Operation | OperationGroup>,
    metaInProgress: boolean,
    onOperationClick: (bcName: string, operationType: string, widgetName: string) => void,
    onExpand: (bcName: string, cursor: string) => void
}

/**
 * "More actions" button for per-row operations
 */
export const RowOperations: React.FC<RowOperationProps> = (props) => {
    const {t} = useTranslation()
    const handleExpand = React.useCallback(() => {
        props.onExpand(props.widgetMeta.bcName, props.selectedKey)
    }, [props.widgetMeta.bcName, props.selectedKey])

    const operations = useWidgetOperations(props.operations, props.widgetMeta)
    const menuItemList: React.ReactNode[] = []

    operations.forEach((item: Operation | OperationGroup) => {
        if ((item as OperationGroup).actions) {
            const groupOperations: React.ReactNode[] = [];
            (item as OperationGroup).actions.forEach(operation => {
                if (operation.scope === 'record') {
                    groupOperations.push(
                        <Menu.Item
                            key={operation.type}
                            onClick={() => {
                                props.onOperationClick(props.widgetMeta.bcName, operation.type, props.widgetMeta.name)
                            }}
                        >
                            { operation.icon && <Icon type={operation.icon} /> }
                            { operation.text }
                        </Menu.Item>
                    )
                }
            })
            if (groupOperations.length) {
                menuItemList.push(
                    <Menu.ItemGroup key={item.type || item.text} title={item.text}>
                        {groupOperations.map((v) => v)}
                    </Menu.ItemGroup>
                )
            }
        }

        const ungroupedOperation = (item as Operation)
        if (ungroupedOperation.scope === 'record') {
            menuItemList.push(
                <Menu.Item
                    key={item.type}
                    onClick={() => {
                        props.onOperationClick(props.widgetMeta.bcName, ungroupedOperation.type, props.widgetMeta.name)
                    }}
                >
                    { ungroupedOperation.icon && <Icon type={ungroupedOperation.icon} /> }
                    {item.text}
                </Menu.Item>
            )
        }
    })

    const overlay = <Menu>
        { props.metaInProgress
            ? <Menu.Item disabled>
                <div className={styles.floatMenuSkeletonWrapper}>
                    <Skeleton active />
                </div>
            </Menu.Item>
            : menuItemList.length
                ? menuItemList
                : <Menu.Item disabled>
                    {t('No operations available')}
                </Menu.Item>
        }
    </Menu>

    return <Dropdown
        trigger={['click']}
        overlay={overlay}
        getPopupContainer={trigger => trigger.parentElement}
    >
        <Icon type="more" onClick={handleExpand} />
    </Dropdown>
}

function mapStateToProps(store: Store, ownProps: RowOperationsOwnProps) {
    const bcName = ownProps.widgetMeta.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const operations = store.view.rowMeta[bcName]
        && store.view.rowMeta[bcName][bcUrl]
        && store.view.rowMeta[bcName][bcUrl].actions
    return {
        operations,
        metaInProgress: !!store.view.metaInProgress[bcName]
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onOperationClick: (bcName: string, operationType: string, widgetName: string) => {
            dispatch($do.sendOperation({ bcName, operationType, widgetName }))
        },
        onExpand: (bcName: string, cursor: string) => {
            dispatch($do.bcSelectRecord({ bcName, cursor }))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RowOperations)
