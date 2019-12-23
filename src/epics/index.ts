import {combineEpics} from 'redux-observable'
import {sessionEpics} from '../epics/session'
import {routerEpics} from '../epics/router'
import {screenEpics} from '../epics/screen'
import {viewEpics} from '../epics/view'
import {dataEpics} from '../epics/data'

export const epics = combineEpics(
    routerEpics,
    sessionEpics,
    screenEpics,
    viewEpics,
    dataEpics
)

export default epics
