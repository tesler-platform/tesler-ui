import { screen, initialState } from '../../screen'
import { $do } from '../../../actions/actions'
import { FieldType, WidgetTypes } from '@tesler-ui/schema'
import { FilterType } from '../../../interfaces/filters'
import { mockStore } from '../../../tests/mockStore'
import { WidgetTableMeta } from '../../../interfaces/widget'

describe(`bcAddFilter reducer`, () => {
    it('sets date filters to local day', () => {
        const store = mockStore().getState()
        store.screen.bo.bc.bcExample = { name: '', parentName: null, url: '', cursor: '' }
        store.view.widgets = [widget]
        const action = $do.bcAddFilter({
            bcName: 'bcExample',
            widgetName: 'text',
            filter: {
                fieldName: 'startDateTime',
                type: FilterType.equals,
                value: [`2021-09-13T11:22:29.255Z`, `2021-09-27T11:22:29.255Z`]
            }
        })
        const newState = screen(initialState, action, store)
        expect(newState.filters.bcExample[0].value).toBe(`2021-09-13T00:00:00.000Z`)
        expect(newState.filters.bcExample[1].value).toBe(`2021-09-27T00:00:00.000Z`)
    })
})

const widget: WidgetTableMeta = {
    bcName: 'bcExample',
    name: 'text',
    type: WidgetTypes.List,
    title: 'text',
    gridWidth: 0,
    position: 0,
    fields: [
        {
            type: FieldType.date,
            key: 'key',
            title: 'test'
        }
    ]
}
