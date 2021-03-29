import { CustomWidgetDescriptor, PopupWidgetTypes } from '../../interfaces/widget'
import extendPopupWidgetTypes from '../extendPopupWidgetTypes'

describe('extendPopupWidgetTypes', () => {
    it('should work', () => {
        const spy = jest.spyOn(Object.getPrototypeOf(PopupWidgetTypes), 'push')

        const presentType = PopupWidgetTypes[0]
        const customWidgets: Record<string, CustomWidgetDescriptor> = {
            type1: {
                component: (): any => null,
                isPopup: true
            },
            type2: {
                component: (): any => null
            },
            [presentType]: {
                component: (): any => null,
                isPopup: true
            }
        }
        extendPopupWidgetTypes(customWidgets)
        expect(spy).toHaveBeenCalledTimes(1)
        spy.mockRestore()
    })

    it('should not work', () => {
        const spy = jest.spyOn(Object, 'entries')
        extendPopupWidgetTypes(null)
        expect(spy).not.toHaveBeenCalled()
    })
})
