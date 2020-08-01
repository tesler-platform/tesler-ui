import {BcMetaState} from '../interfaces/bc'

/**
 * Find all descendants of specified business component
 *
 * @param bcName Business component
 * @param bc Lookup dictionary of business components
 */
export const findBcDescendants = (bcName: string, bc: Record<string, BcMetaState>) => {
    const bcMeta = Object.values(bc).filter((bcLambda) => bcLambda.name === bcName).shift()
    const bcUrl = `${bcMeta.url}/:id`
    return Object.values(bc)
    .filter((bcLambda) => bcLambda.url.includes(bcUrl))
    .map((bcLambda) => bcLambda.name)
}
