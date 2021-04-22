import React from 'react'
import { Menu, Icon, Skeleton } from 'antd'
import { Operation, isOperationGroup } from '../../interfaces/operation'
import { buildBcUrl } from '../../utils/strings'
import { useSelector, useDispatch } from 'react-redux'
import { Store } from '../../interfaces/store'
import { $do } from '../../actions/actions'
import { useWidgetOperations } from '../../hooks/useWidgetOperations'
import { WidgetMeta } from '../../interfaces/widget'
import { ClickParam } from 'antd/lib/menu'
import { useTranslation } from 'react-i18next'
import * as styles from './RowOperationsMenu.less'

/**
 * {@link RowOperationsMenu | RowOperationsMenu} properties
 */
interface RowOperationsMenuProps {
    /**
     * Widget meta description
     */
    meta: WidgetMeta
    /**
     * Use when business component differs from widget's (e.g. hierarchies nested level)
     */
    bcName?: string
}

/**
 * Menu with available record operations
 *
 * On operation selection dispatches {@link ActionPayloadTypes.sendOperation | sendOperation}
 *
 * @param props - Component properties
 */
export const RowOperationsMenu: React.FC<RowOperationsMenuProps> = ({ meta, bcName: hierarchyBc, ...rest }) => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const bcName = hierarchyBc || meta.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const loading = useSelector((store: Store) => !!store.view.metaInProgress[meta.bcName])
    /**
     * Operations from row meta
     */
    const operations = useSelector((store: Store) => store.view.rowMeta[bcName]?.[bcUrl]?.actions)
    /**
     * Filter operations based on widget settings
     */
    const operationList = useWidgetOperations(operations, meta, bcName)

    const handleClick = React.useCallback(
        (param: ClickParam) => {
            const item = param.item as Operation
            dispatch($do.sendOperation({ bcName, operationType: item.type, widgetName: meta.name }))
        },
        [meta.name, bcName, dispatch]
    )

    const menuItem = React.useCallback(
        (item: Operation) => (
            <Menu.Item key={item.type} onClick={handleClick}>
                {item.icon && <Icon type={item.icon} />}
                {item.text}
            </Menu.Item>
        ),
        [handleClick]
    )

    const menuItemList = operationList
        .map(item => {
            if (isOperationGroup(item)) {
                return (
                    <Menu.ItemGroup key={item.type || item.text} title={item.text}>
                        {item.actions.filter(operation => operation.scope === 'record').map(menuItem)}
                    </Menu.ItemGroup>
                )
            }
            return item.scope === 'record' ? menuItem(item) : null
        })
        .filter(item => !!item)
    const displayedItems = menuItemList.length ? menuItemList : <Menu.Item disabled>{t('No operations available')}</Menu.Item>

    return <Menu {...rest}>{loading ? <Skeleton active className={styles.skeleton} /> : displayedItems}</Menu>
}

export default React.memo(RowOperationsMenu)
