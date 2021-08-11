import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import NumberInput from './NumberInput'
import { NumberTypes } from './formaters'
import React from 'react'
import { FieldType } from '../../../interfaces/view'
import { NumberFieldMeta } from '../../../interfaces/widget'

describe('NumberInput testing', () => {
    const fieldName = 'fieldName'
    const numberFieldMeta = { key: 'someInput', type: FieldType.number, label: fieldName }

    let store: Store<CoreStore> = null
    beforeAll(() => {
        store = mockStore()
    })

    it('should render ReadOnly', () => {
        const wrapper = mount(
            <Provider store={store}>
                <NumberInput value={100} type={NumberTypes.number} readOnly={true} meta={numberFieldMeta as NumberFieldMeta} />
            </Provider>
        )
        expect(wrapper.find('Memo(ReadOnlyField)').length).toBe(1)
    })
})
