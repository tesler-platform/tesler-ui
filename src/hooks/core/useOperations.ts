import { useRowMetaProps, useWidgetProps } from './selectors'
import { useWidgetOperations } from '../useWidgetOperations'
import { isOperationGroup, Operation, OperationGroup } from '../../interfaces/operation'
import { useDispatch } from 'react-redux'
import { useCallback, useMemo } from 'react'
import { $do } from '../../actions/actions'

const filterOperationsByScope = (operations: Array<Operation | OperationGroup>, scope: Operation['scope']) => {
    return operations
        .map(operation => {
            if (isOperationGroup(operation)) {
                return {
                    ...operation,
                    actions: operation.actions.filter(groupOperation => groupOperation.scope === scope)
                }
            }

            return operation.scope === scope ? operation : null
        })
        .filter(operation => !!operation)
}

interface OperationsConfig {
    /**
     * TODO
     */
    includeSelf?: boolean
    /**
     * TODO ENG Если есть scope, то по нему фильтруются все операции включая операции принадлежащие к группам
     */
    scope?: Operation['scope']
    /**
     * Nested hierarchies might pass bcName directly
     */
    hierarchyBcName?: string
}
/**
 * TODO ENG Возвращает объект содержащий список операций.
 * TODO MY Так же нужно подумать зачем нужен widget с другим bc для hierarchyBcName. Так было в компоненте из которого я перенес логику.
 * TODO MY подумать над реализацией нескольких интерфейсов для аналогичных хуков. Передавать не widgetName, а widget.
 *
 * @param widgetName
 * @param includeSelf
 * @param scope
 * @param hierarchyBcName
 */
export function useOperations(widgetName: string, { includeSelf = true, scope, hierarchyBcName }: OperationsConfig = {}) {
    const { bcName: widgetBcName, widget } = useWidgetProps(widgetName)
    const bcNameForOperations = hierarchyBcName ?? widgetBcName
    const { rowMetaActions, metaInProgress } = useRowMetaProps({ bcName: bcNameForOperations, includeSelf })
    /**
     * Filter operations based on widget settings
     */
    let operations = useWidgetOperations(rowMetaActions, widget, bcNameForOperations)

    operations = useMemo(() => (scope ? filterOperationsByScope(operations, scope) : operations), [operations, scope])

    const dispatch = useDispatch()

    const sendOperation = useCallback(
        (operationType: string, confirm?: string) => {
            dispatch($do.sendOperation({ bcName: bcNameForOperations, operationType, widgetName: widgetName, confirm }))
        },
        [bcNameForOperations, dispatch, widgetName]
    )
    /**
     * Change cursor and fetches row meta to get
     */
    const selectRecord = useCallback(
        (cursor: string) => {
            dispatch($do.bcSelectRecord({ bcName: bcNameForOperations, cursor }))
        },
        [bcNameForOperations, dispatch]
    )

    return { operations, operationsExist: operations.length, loading: metaInProgress, sendOperation, selectRecord }
}
