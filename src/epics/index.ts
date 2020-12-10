import { utilsEpics } from './utils'
import { sessionEpics } from '../epics/session'
import { routerEpics } from '../epics/router'
import { screenEpics } from '../epics/screen'
import { viewEpics } from '../epics/view'
import { dataEpics } from '../epics/data'
import { combineEpics, Epic } from 'redux-observable'

export const coreEpics = {
    utilsEpics,
    routerEpics,
    sessionEpics,
    screenEpics,
    viewEpics,
    dataEpics
}

/**
 * @deprecated TODO: For backward compatibility; remove in 2.0.0
 */
export const legacyCoreEpics: Epic<any, any> = combineEpics(
    ...Object.values(coreEpics).map(epics => {
        return combineEpics(...Object.values(epics))
    })
)

export default coreEpics
