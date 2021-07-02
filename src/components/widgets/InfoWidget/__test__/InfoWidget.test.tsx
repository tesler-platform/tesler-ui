import { Store } from 'redux'
import { Store as CoreStore } from '../../../../interfaces/store'
import { mockStore } from '../../../../tests/mockStore'
import { mount } from 'enzyme'
import * as React from 'react'
import InfoWidget from '../InfoWidget'
import { Provider } from 'react-redux'
import { WidgetInfoMeta, WidgetTypes } from '../../../../interfaces/widget'
import { FieldType } from '../../../../interfaces/view'

const testBcName = 'bcExample'
const initialCursor = '1001'

describe('InfoWidget test', () => {
    let store: Store<CoreStore> = null

    const meta: WidgetInfoMeta = {
        type: WidgetTypes.Info,
        name: 'name',
        title: 'title',
        bcName: testBcName,
        gridWidth: 2,
        position: 1,
        fields: [
            {
                blockId: 1,
                name: 'AAA',
                fields: [
                    { label: '#', key: 'number', type: FieldType.input, hidden: true },
                    { label: 'Name', key: 'name', type: FieldType.input }
                ]
            }
        ],
        options: {
            layout: {
                rows: [
                    {
                        cols: [
                            {
                                fieldKey: 'name',
                                span: 10
                            }
                        ]
                    },
                    {
                        cols: [
                            {
                                fieldKey: 'number',
                                span: 10
                            }
                        ]
                    }
                ]
            }
        }
    }
    beforeAll(() => {
        store = mockStore()
        store.getState().data = {
            [testBcName]: [{ id: initialCursor, vstamp: 3, name: 'Test Name', number: '123456' }]
        }
    })
    beforeEach(() => {
        store.getState().screen.bo.bc[testBcName] = {
            name: testBcName,
            parentName: null,
            url: testBcName,
            defaultSort: null,
            cursor: initialCursor
        }
    })
    it('should render', () => {
        const wrapper = mount(
            <Provider store={store}>
                <InfoWidget meta={meta} containerStyle={'containerClassName'} />
            </Provider>
        )
        expect(wrapper.find('div').findWhere(i => i.hasClass('containerClassName')).length).toEqual(1)
        expect(wrapper.find('Memo(InfoRow)').length).toBeGreaterThan(0)
    })
})
