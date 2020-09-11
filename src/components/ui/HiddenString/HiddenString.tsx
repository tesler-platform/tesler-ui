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
 * Hide end part string by '...'
 * Show full string on click at '...'
 */

import React from 'react'
import styles from './HiddenString.less'
import i18n from 'i18next'
import {DataValue} from '../../../interfaces/data'

export interface HiddenStringProps {
    inputString: string | DataValue,
    showLength: number
}

export const HiddenString: React.FC<HiddenStringProps> = (props) => {
    const { inputString, showLength } = props

    if (typeof(inputString) !== 'string' || !(showLength && inputString?.length > showLength)) {
        return <div>{inputString}</div>
    }
    const [valueString, setValueString] = React.useState(inputString.substr(0, showLength))
    const [showed, setShowed] = React.useState(false)

    return <div>
        {valueString}
        {showed
            ? <span><br/><span className={styles.pointHide}
                    onClick={() => {setValueString(inputString.substr(0, showLength)), setShowed(false)}}
            >{i18n.t('Hide')}</span></span>
            : <span className={styles.pointer}
                    onClick={() => {setValueString(inputString), setShowed(true)}}
            >...</span>}
    </div>
}

export default HiddenString
