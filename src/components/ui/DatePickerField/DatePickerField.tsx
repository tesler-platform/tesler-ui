import React, {RefAttributes} from 'react'
import moment from 'moment'
import {DatePicker} from 'antd'
import {DatePickerProps} from 'antd/es/date-picker/interface'
import {toISOLocal} from '../../../utils/dates'
import * as styles from './DatePickerField.less'
import cn from 'classnames'
import ReadOnlyField from '../ReadOnlyField/ReadOnlyField'

export interface IDatePickerFieldProps {
    readOnly?: boolean,
    disabled?: boolean,
    value?: string | null,
    onChange?: (date: string | null) => void
    showToday?: boolean
    allowClear?: boolean
    onOpenChange?: (status: boolean) => void
    disabledDate?: (current: moment.Moment) => boolean
    showTime?: boolean
    monthYear?: boolean
    showSeconds?: boolean
    backgroundColor?: string | null
    className?: string
    resetForceFocus?: () => void
    dateFormatter?: (date: moment.Moment) => string,
    calendarContainer?: HTMLElement,
    onDrillDown?: () => void
}

const dateFormat = moment.ISO_8601
const outputMonthYearFormat = 'MMMM YYYY'
const outputDateFormat = 'DD.MM.YYYY'
const outputDateTimeFormat = 'DD.MM.YYYY HH:mm'
const outputDateTimeWithSecondsFormat = 'DD.MM.YYYY HH:mm:ss'

const DatePickerField: React.FunctionComponent<IDatePickerFieldProps> = (props) => {
    const {
        disabled,
        value,
        showTime,
        showSeconds,
        monthYear
    } = props

    if (props.readOnly) {
        return <ReadOnlyField
            className={props.className}
            backgroundColor={props.backgroundColor}
            onDrillDown={props.onDrillDown}
        >
            {DatePickerFieldFormat(value, showTime, showSeconds, monthYear)}
        </ReadOnlyField>
    }

    const dateFormatter = (props.dateFormatter) ? props.dateFormatter : toISOLocal
    const datePickerRef = React.useRef(null)
    const handleChange = React.useCallback(
        (date: moment.Moment) => {
            if (props.onChange) {
                if (props.monthYear) {
                    props.onChange(date ? dateFormatter(date.startOf('month')) : null)
                } else {
                    props.onChange(date ? dateFormatter(date) : null)
                }
            }
        },
        [props.onChange, props.monthYear]
    )
    const getCalendarContainer = React.useCallback(
        (triggerNode: Element) => props.calendarContainer,
        [props.calendarContainer]
    )

    let momentObject
    if (value) {
        momentObject = monthYear
            ? moment(value, dateFormat, true).startOf('month')
            : moment(value, dateFormat, true)
    }

    const format = getFormat(showTime, showSeconds, monthYear)
    const timeOptions = showTime ? { format: showSeconds ? 'HH:mm:ss' : 'HH:mm'} : null

    const extendedProps: DatePickerProps & RefAttributes<any> = {
        ...props,
        className: cn(styles.datePicker, props.className),
        value: momentObject,
        disabled: disabled,
        format,
        onChange: handleChange,
        showTime: timeOptions,
        style: {
            backgroundColor: props.backgroundColor,
        },
        getCalendarContainer: (props.calendarContainer) ? getCalendarContainer : null,
        ref: datePickerRef
    }

    if (props.disabled) {
        extendedProps.open = false
    }

    return monthYear
        ? <DatePicker.MonthPicker {...extendedProps} />
        : <DatePicker {...extendedProps} />
}

export const getFormat = (showTime?: boolean, showSeconds?: boolean, monthYear?: boolean) => {
    if (showSeconds) {
        return outputDateTimeWithSecondsFormat
    } else if (showTime) {
        return outputDateTimeFormat
    } else if (monthYear) {
        return outputMonthYearFormat
    } else {
        return outputDateFormat
    }
}

export const DatePickerFieldFormat = (
    date: string | null,
    withTime?: boolean,
    withSeconds?: boolean,
    monthYear?: boolean
): string => {
    if (monthYear) {moment.locale('ru')}
    if (!date) {
        return ''
    }
    return moment(date, dateFormat).format(getFormat(withTime, withSeconds, monthYear))
}

export default React.memo(DatePickerField)
