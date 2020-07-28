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
 * Opens when column filter requested
 */

import React, {FormEvent} from 'react'
import {Form, Button} from 'antd'
import styles from './FilterPopup.less'
import {BcFilter} from '../../interfaces/filters'
import {getFilterType} from '../../utils/filters'
import {useDispatch, useSelector} from 'react-redux'
import {$do} from '../../actions/actions'
import {Store} from '../../interfaces/store'
import {WidgetField} from '../../interfaces/widget'
import {DataValue} from '../../interfaces/data'
import {useTranslation} from 'react-i18next'

export interface FilterPopupProps {
    widgetName: string,
    fieldKey: string,
    value: DataValue | DataValue[],
    children: React.ReactNode,
    onApply?: () => void,
    onCancel?: () => void
}

export const FilterPopup: React.FC<FilterPopupProps> = (props) => {

    const widget = useSelector((store: Store) => {
        return store.view.widgets.find(item => item.name === props.widgetName)
    })
    const filter = useSelector((store: Store) => {
        return store.screen.filters[widget?.bcName]?.find(item => item.fieldName === props.fieldKey)
    })
    const widgetMeta = (widget?.fields as WidgetField[])?.find(item => item.key === props.fieldKey)
    const dispatch = useDispatch()
    const {t} = useTranslation()
    if (!widgetMeta) {
        return null
    }
    const handleApply = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const newFilter: BcFilter = {
            type: getFilterType(widgetMeta.type),
            value: props.value,
            fieldName: props.fieldKey
        }
        if (!props.value) {
            dispatch($do.bcRemoveFilter({ bcName: widget.bcName, filter }))

        } else {
            dispatch($do.bcAddFilter({ bcName: widget.bcName, filter: newFilter }))
        }
        dispatch($do.bcForceUpdate({ bcName: widget.bcName }))
        props.onApply?.()
    }

    const handleCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        if (filter) {
            dispatch($do.bcRemoveFilter({ bcName: widget.bcName, filter }))
            dispatch($do.bcForceUpdate({ bcName: widget.bcName }))
        }
        props.onCancel?.()
    }

    return <Form onSubmit={handleApply} layout="vertical">
        {props.children}
        <div className={styles.operators}>
            <Button className={styles.button} htmlType="submit">
                {t('Apply')}
            </Button>
            <Button className={styles.button} onClick={handleCancel}>
                {t('Clear')}
            </Button>
        </div>
    </Form>
}

export default React.memo(FilterPopup)
