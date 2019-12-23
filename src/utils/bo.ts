import {ObjectMap} from '../interfaces/objectMap'
import {BcMetaState} from '../interfaces/bc'

/**
 * Найти всех потомков указанной БК
 *
 * @param bcName От какой БК искать потомков
 * @param bc Словарь БК для поиска
 */
export const findBcDescendants = (bcName: string, bc: ObjectMap<BcMetaState>) => {
    const bcMeta = Object.values(bc).filter((bcLambda) => bcLambda.name === bcName).shift()
    const bcUrl = `${bcMeta.url}/:id`
    return Object.values(bc)
    .filter((bcLambda) => bcLambda.url.includes(bcUrl))
    .map((bcLambda) => bcLambda.name)
}
