import { shallow } from 'enzyme'
import React from 'react'
import { InfoValueWrapper } from '../InfoValueWrapper'

describe('InfoValueWrapper test', () => {
    const coll = { fieldKey: 'translatedName', span: 8 }
    const props = {
        col: coll,
        row: {
            cols: [coll]
        }
    }
    const children = [<div key={1}>Child1</div>, <div key={2}>Child2</div>]

    it('should be rendered', () => {
        const wrapper = shallow(<InfoValueWrapper {...props} />)
        expect(wrapper.find('div').findWhere(i => i.hasClass('fieldArea')).length).toEqual(1)
    })
    it('should render children', () => {
        const wrapper = shallow(<InfoValueWrapper {...props}>{children}</InfoValueWrapper>)
        expect(
            wrapper
                .find('div')
                .findWhere(i => i.hasClass('fieldArea'))
                .children().length
        ).toEqual(children.length)
    })
})
