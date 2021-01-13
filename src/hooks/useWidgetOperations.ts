import { useMemo } from 'react'
import { Operation, OperationGroup, isOperationGroup, OperationInclusionDescriptor } from '../interfaces/operation'
import { WidgetMeta } from '../interfaces/widget'

const emptyArray: Array<Operation | OperationGroup> = []

/**
 * Возвращает мемоизированный список операций согласно списку включения/исключения в мете виджета
 *
 * @param operations Список операций
 * @param widgetMeta Мета виджета
 */
export function useWidgetOperations(operations: Array<Operation | OperationGroup>, widgetMeta: WidgetMeta) {
    return useMemo(() => {
        if (!widgetMeta.options || !widgetMeta.options.actionGroups) {
            return operations || emptyArray
        }

        const { include, exclude } = widgetMeta.options.actionGroups
        return getIncludedOperations(operations || emptyArray, include, exclude)
    }, [operations, widgetMeta])
}

/**
 * Возвращает список операций с учетом списков включения/исключения
 * Если элемент является группой операций, то входящие в нее операции также проверяются по этим спискам,
 * при этом учитываются оба списка исключения: собственный список внутри группы и общий (операций и групп)
 *
 * @param operations Список операций
 * @param include Список включаемых операций
 * @param exclude Список исключаемых операций
 */
export function getIncludedOperations(
    operations: Array<Operation | OperationGroup>,
    include: OperationInclusionDescriptor[],
    exclude: OperationInclusionDescriptor[]
) {
    const result: Array<Operation | OperationGroup> = []
    operations.forEach(item => {
        if (shouldPickOperation(item, include, exclude)) {
            if (isOperationGroup(item)) {
                const filtered = item.actions.filter(operation => {
                    if (!include) {
                        return shouldPickOperation(operation, null, exclude)
                    }
                    const nestedDescriptor = include.find(descriptor => getDescriptorValue(descriptor) === item.type)
                    const excludeAll =
                        nestedDescriptor && typeof nestedDescriptor === 'string'
                            ? [nestedDescriptor, ...(exclude || [])]
                            : [...((nestedDescriptor as any).exclude || []), ...(exclude || [])]
                    return (
                        nestedDescriptor &&
                        shouldPickOperation(operation, typeof nestedDescriptor !== 'string' && nestedDescriptor.include, excludeAll)
                    )
                })
                result.push({ ...item, actions: filtered })
            } else {
                result.push(item)
            }
        }
    })
    return result
}

/**
 * Проверяет операцию или группу операций по спискам включения/исключения:
 * - если список включения задан, то операция должна присутствовать в нем и отсутствовать в списке исключения
 * - если список включения не задан, то операция должна отсутствовать в списке исключения
 *
 * @param item Проверяемая операция
 * @param include Список включаемых операций
 * @param exclude Список исключаемых операций
 */
export function shouldPickOperation(
    item: Operation | OperationGroup,
    include: OperationInclusionDescriptor[],
    exclude: OperationInclusionDescriptor[]
) {
    if (!include && exclude) {
        return exclude.every(descriptor => getDescriptorValue(descriptor) !== item.type)
    }
    if (include && !exclude) {
        return include.some(descriptor => getDescriptorValue(descriptor) === item.type)
    }
    if (include && exclude) {
        return (
            include.some(descriptor => getDescriptorValue(descriptor) === item.type) &&
            exclude.every(descriptor => getDescriptorValue(descriptor) !== item.type)
        )
    }
    return true
}

/**
 * Получает тип операции из элемента списка включения/исключения
 *
 * @param descriptor Строка или объект с этой строкой
 */
function getDescriptorValue(descriptor: OperationInclusionDescriptor) {
    if (typeof descriptor === 'string') {
        return descriptor
    }
    return descriptor.type
}
