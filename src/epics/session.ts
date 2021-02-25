import { loginEpic } from './session/loginDone'
import { refreshMetaEpic } from './session/refreshMeta'
import { loginByAnotherRoleEpic } from './session/loginByAnotherRole'
import { switchRoleEpic } from './session/switchRole'

export const sessionEpics = {
    loginByAnotherRoleEpic,
    refreshMetaEpic,
    switchRoleEpic,
    loginEpic
}
