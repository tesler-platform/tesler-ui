import React from 'react'
import { Row, Col } from 'antd'
import { CustomWidgetDescriptor, WidgetMeta } from '../../../interfaces/widget'
import { ObjectMap } from '../../../interfaces/objectMap'
import Widget from '../../Widget/Widget'

export interface DashboardLayoutProps {
    widgets: WidgetMeta[]
    customWidgets?: Record<string, CustomWidgetDescriptor>
    skipWidgetTypes?: string[]
    card?: (props: any) => React.ReactElement<any>
}

/**
 * TODO
 *
 * @param props
 * @category Components
 */
export function DashboardLayout(props: DashboardLayoutProps) {
    const widgetsByRow = React.useMemo(() => {
        return groupByRow(props.widgets, props.skipWidgetTypes || [])
    }, [props.widgets, props.skipWidgetTypes])
    return (
        <React.Fragment>
            {Object.values(widgetsByRow).map((row, rowIndex) => (
                <Row key={rowIndex}>
                    {row.map((widget, colIndex) => (
                        <Col key={colIndex} span={24}>
                            <Widget meta={widget} card={props.card} customWidgets={props.customWidgets} />
                        </Col>
                    ))}
                </Row>
            ))}
        </React.Fragment>
    )
}

/**
 * TODO
 *
 * @param widgets
 * @param skipWidgetTypes
 */
function groupByRow(widgets: WidgetMeta[], skipWidgetTypes: string[]) {
    const byRow: ObjectMap<WidgetMeta[]> = {}
    widgets
        .filter(item => {
            return !skipWidgetTypes.includes(item.type)
        })
        .forEach(item => {
            if (!byRow[item.position]) {
                byRow[item.position] = []
            }
            byRow[item.position].push(item)
        })
    return byRow
}
/**
 * @category Components
 */
export const MemoizedDashboard = React.memo(DashboardLayout)

export default MemoizedDashboard
