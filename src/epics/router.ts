/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { drillDown } from './router/drilldown'
import { selectScreenFail } from './router/selectScreenFail'
import { selectViewFail } from './router/selectViewFail'
import { changeLocation } from './router/changeLocation'
import { changeScreen } from './router/selectScreen'
import { changeView } from './router/selectView'
import { loginDone } from './router/loginDone'
import { handleRouter } from './router/handleRouter'
import { userDrillDown } from './router/userDrillDown'

export const routerEpics = {
    changeLocation,
    loginDone,
    changeScreen,
    changeView,
    drillDown,
    userDrillDown,
    handleRouter,
    selectScreenFail,
    selectViewFail
}
