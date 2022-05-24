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

/**
 * Utility for simple unit-testing of epics
 *
 * TODO: Probably will not be needed after migration to redux-observable 1.* and RxJS 6.* with TestScheduler.run available
 */

import { Notification, Observable } from 'rxjs'
import { AnyAction } from '../actions/actions'
import { TestScheduler } from 'rxjs/testing'

/**
 * Result frame of test scheduler
 */
type TestSchedulerFrame = {
    /**
     * Probably an order
     */
    frame: number
    /**
     * Scheduler notifaction;
     * important fields are:
     * - `kind` - (`N` - next, succes; `C` - complete, chain terminator? and `E` - error)
     * - `value` - result obsevable value (i.e. action)
     */
    notification: Notification<AnyAction>
}

/**
 * Fires an epic and a callback with array of observables, returned from epic
 *
 * @param epic Epic chain to test
 * @param callback Epic result callback
 */
export function testEpic(epic: Observable<AnyAction>, callback: (result: AnyAction[]) => void) {
    const testScheduler = new TestScheduler((actual: TestSchedulerFrame[]) => {
        const nextActionNotifications = actual.filter(item => item.notification.kind === 'N').map(item => item.notification.value)
        actual
            .filter(item => item.notification.kind === 'E')
            .forEach(item => {
                console.error(item.notification.error)
            })
        callback(nextActionNotifications)
    })
    testScheduler.expectObservable(epic).toBe('a') // some `marble` testing stuff which we do not use
    testScheduler.flush()
}
