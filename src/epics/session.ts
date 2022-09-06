import { loginEpic } from './session/loginDone'
import { refreshMetaEpic } from './session/refreshMeta'
import { loginByAnotherRoleEpic } from './session/loginByAnotherRole'
import { switchRoleEpic } from './session/switchRole'
import { refreshMetaAndReloadPage } from './session/refreshMetaAndReloadPage'

export const sessionEpics = {
    loginByAnotherRoleEpic,
    refreshMetaEpic,
    refreshMetaAndReloadPage,
    switchRoleEpic,
    loginEpic
}
