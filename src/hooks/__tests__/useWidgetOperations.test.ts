import { getIncludedOperations, shouldPickOperation } from '../useWidgetOperations'
import { Operation, OperationGroup } from '../../interfaces/operation'

const baseOperation: Operation = { type: null, scope: 'record', showOnlyIcon: false, text: 'Действие' }
const baseGroup: OperationGroup = { type: null, actions: null, maxGroupVisualButtonsCount: 1, text: 'Группа действий' }

describe('getIncludedOperations', () => {
    it('should include nested operations', () => {
        const result = getIncludedOperations(
            sampleOperations,
            [
                {
                    type: 'group1',
                    include: ['operation3', 'operation5']
                },
                'group2'
            ],
            null
        )
        expect((result[0] as OperationGroup).actions.length).toBe(2)
        expect((result[0] as OperationGroup).actions[0].type).toBe('operation3')
        expect((result[0] as OperationGroup).actions[1].type).toBe('operation5')
        expect((result[1] as OperationGroup).actions.length).toBe(2)
        expect((result[1] as OperationGroup).actions[0].type).toBe('operation6')
        expect((result[1] as OperationGroup).actions[1].type).toBe('operation7')
    })
    it('should exclude from operations and groups', () => {
        const result = getIncludedOperations(sampleOperations, null, ['operation1', 'operation4'])
        expect(result[0].type).toBe('operation2')
        expect((result[1] as OperationGroup).actions.length).toBe(2)
        expect((result[1] as OperationGroup).actions[0].type).toBe('operation3')
        expect((result[1] as OperationGroup).actions[1].type).toBe('operation5')
        expect((result[2] as OperationGroup).actions.length).toBe(2)
    })
    it('should exclude previously included nested operations', () => {
        const result = getIncludedOperations(
            sampleOperations,
            [
                {
                    type: 'group1',
                    include: ['operation3', 'operation5']
                },
                'group2'
            ],
            ['operation1', 'operation6']
        )
        expect((result[0] as OperationGroup).actions.length).toBe(2)
        expect((result[0] as OperationGroup).actions[0].type).toBe('operation3')
        expect((result[0] as OperationGroup).actions[1].type).toBe('operation5')
        expect((result[1] as OperationGroup).actions.length).toBe(1)
        expect((result[1] as OperationGroup).actions[0].type).toBe('operation7')
    })
})

describe('shouldPickOperation', () => {
    it('should handle groups', () => {
        expect(shouldPickOperation({ ...baseOperation, type: 'operation1' }, ['operation1'], null)).toBe(true)
    })
    it('should exclude', () => {
        expect(shouldPickOperation({ ...baseOperation, type: 'operation1' }, null, ['operation1', 'operation3'])).toBe(false)
        expect(shouldPickOperation({ ...baseOperation, type: 'operation2' }, null, ['operation1', 'operation3'])).toBe(true)
    })
    it('should include', () => {
        expect(shouldPickOperation({ ...baseOperation, type: 'operation1' }, ['operation1', 'operation3'], null)).toBe(true)
        expect(shouldPickOperation({ ...baseOperation, type: 'operation2' }, ['operation1', 'operation3'], null)).toBe(false)
    })
    it('should include and exclude', () => {
        expect(shouldPickOperation({ ...baseOperation, type: 'operation1' }, ['operation1', 'operation3'], ['operation1'])).toBe(false)
        expect(shouldPickOperation({ ...baseOperation, type: 'operation2' }, ['operation1', 'operation3'], ['operation2'])).toBe(false)
        expect(shouldPickOperation({ ...baseOperation, type: 'operation3' }, ['operation1', 'operation3'], ['operation2'])).toBe(true)
    })
    it('should treat empty arrays as falsy', () => {
        expect(shouldPickOperation({ ...baseOperation, type: 'operation1' }, null, ['operation1', 'operation3'])).toBe(
            shouldPickOperation({ ...baseOperation, type: 'operation1' }, [], ['operation1', 'operation3'])
        )
        expect(shouldPickOperation({ ...baseOperation, type: 'operation1' }, ['operation1', 'operation3'], null)).toBe(
            shouldPickOperation({ ...baseOperation, type: 'operation1' }, ['operation1', 'operation3'], [])
        )
    })
})

const sampleOperations: Array<Operation | OperationGroup> = [
    { ...baseOperation, type: 'operation1' },
    { ...baseOperation, type: 'operation2' },
    {
        ...baseGroup,
        type: 'group1',
        actions: [
            { ...baseOperation, type: 'operation3' },
            { ...baseOperation, type: 'operation4' },
            { ...baseOperation, type: 'operation5' }
        ]
    },
    {
        ...baseGroup,
        type: 'group2',
        actions: [
            { ...baseOperation, type: 'operation6' },
            { ...baseOperation, type: 'operation7' }
        ]
    }
]
