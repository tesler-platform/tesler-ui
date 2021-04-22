import React from 'react'
import { useRowMenu, isOutsideMove } from '../useRowMenu'
import { mount } from 'enzyme'

describe('useRowMenu', () => {
    it('returns two refs and hover callbacks', () => {
        const Component = () => {
            const setRowMock = jest.fn()
            const e: any = {}
            const record = { id: '1', vstamp: 0 }
            const [operationsRef, parentRef, onHover] = useRowMenu()
            operationsRef.current = {
                setRow: setRowMock,
                containerRef: null
            }
            const { onMouseEnter, onMouseLeave } = onHover(record)
            expect(setRowMock).toBeCalledTimes(0)
            onMouseEnter(e)
            expect(setRowMock).toBeCalledTimes(1)
            expect(setRowMock).toBeCalledWith(record, e)
            onMouseLeave(e)
            expect(setRowMock).toBeCalledTimes(2)
            expect(setRowMock).toBeCalledWith(null, e)
            return <div ref={parentRef} />
        }
        mount(<Component />)
    })
})

describe.skip('useRowMenuInstance', () => {
    /**
     * TODO
     */
})

describe('isOutsideMove', () => {
    it('returns true if no `container` or `<tr>` are found in ancestors chain', () => {
        const container: any = {
            nodeName: 'DIV'
        }
        const e: any = {
            relatedTarget: {
                parentElement: {
                    nodeName: 'DIV',
                    parentElement: {
                        nodeName: 'DIV'
                    }
                }
            }
        }
        expect(isOutsideMove(e, container)).toBe(true)
    })
    it('returns false if there `container` in ancestors chain', () => {
        const container: any = {
            nodeName: 'DIV'
        }
        const e: any = {
            relatedTarget: {
                parentElement: {
                    nodeName: 'DIV',
                    parentElement: container
                }
            }
        }
        expect(isOutsideMove(e, container)).toBe(false)
    })
    it('returns false if there `<tr>` in ancestors chain', () => {
        const container: any = {
            nodeName: 'DIV'
        }
        const e: any = {
            relatedTarget: {
                parentElement: {
                    nodeName: 'TR',
                    parentElement: container
                }
            }
        }
        expect(isOutsideMove(e, container)).toBe(true)
    })
})
