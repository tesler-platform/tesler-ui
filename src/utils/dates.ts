import * as moment from 'moment'

/**
 * TODO
 * 
 * @param date 
 */
export function toISOLocal(date: moment.Moment) {
    if (date.year() < 0 || date.year() > 9999) {
        return date.format('YYYYYY-MM-DD[T]HH:mm:ss')
    }
    return date.format('YYYY-MM-DD[T]HH:mm:ss')
}
