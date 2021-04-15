import view, { initialState } from '../view'
import { $do } from '../../actions/actions'
import { OperationTypeCrud } from '@tesler-ui/schema'
import { RowMeta } from '../../interfaces/rowMeta'

describe('view reducer test', () => {
    it('should react on action selectView', () => {
        const nextState = view(
            initialState,
            $do.selectView({
                url: 'url',
                name: 'name',
                widgets: []
            }),
            null
        )
        expect(nextState.url).toBe('url')
    })

    it('should react on action bcFetchRowMeta', () => {
        const nextState = view(
            initialState,
            $do.bcFetchRowMeta({
                bcName: 'bcName',
                widgetName: 'widgetName'
            }),
            null
        )
        expect(nextState.metaInProgress['bcName']).toBeTruthy()
    })
    it('should react on action bcLoadMore', () => {
        const nextState = view(initialState, $do.bcLoadMore({ bcName: 'bcName', widgetName: 'widgetName' }), null)
        expect(nextState.infiniteWidgets).toStrictEqual(['widgetName'])
    })
    it('should react on action sendOperation save', () => {
        const nextState = view(
            initialState,
            $do.sendOperation({ operationType: OperationTypeCrud.save, widgetName: 'w', bcName: 'bcName' }),
            null
        )
        expect(nextState).toStrictEqual(initialState)
    })
    it('should react on action sendOperation create', () => {
        const nextState = view(
            initialState,
            $do.sendOperation({ operationType: OperationTypeCrud.create, widgetName: 'w', bcName: 'bcName' }),
            null
        )
        expect(nextState.metaInProgress['bcName']).toBeTruthy()
    })
    it('should react on action bcFetchRowMetaSuccess', () => {
        const rowMeta: RowMeta = {
            actions: [],
            fields: []
        }
        const nextState = view(initialState, $do.bcFetchRowMetaSuccess({ bcName: 'bcName', bcUrl: 'url', rowMeta: rowMeta }), null)

        expect(nextState.metaInProgress['bcName']).toBeFalsy()
        expect(nextState.rowMeta['bcName']).toStrictEqual({ url: rowMeta })
    })

    it('should clear selectedCell after creating new record', () => {
        const state = {
            ...initialState,
            selectedCell: {
                widgetName: 'some value',
                rowId: 'some value',
                fieldKey: 'some value'
            }
        }
        const nextState = view(
            state,
            $do.bcNewDataSuccess({
                bcName: 'bcNAme',
                dataItem: { id: '1', vstamp: -1 },
                bcUrl: 'bcUrl'
            }),
            null
        )
        expect(nextState.selectedCell).toBe(initialState.selectedCell)
    })

    it('should react on action bcNewDataFail', () => {
        const nextState = view(initialState, $do.bcNewDataFail({ bcName: 'bcName' }), null)
        expect(nextState.metaInProgress['bcName']).toBeFalsy()
    })

    it('should react on action bcFetchRowMetaFail', () => {
        const nextState = view(initialState, $do.bcFetchRowMetaFail({ bcName: 'bcName' }), null)
        expect(nextState.metaInProgress['bcName']).toBeFalsy()
    })

    it('should react on action forceActiveChangeFail', () => {
        const nextState = view(
            {
                ...initialState,
                rowMeta: {
                    bcName: {
                        url: null
                    }
                }
            },
            $do.forceActiveChangeFail({
                bcName: 'bcName',
                bcUrl: 'url',
                viewError: 'error',
                entityError: { bcName: 'bcName', id: 'id', fields: { a: 'a' } }
            }),
            null
        )
        expect(nextState.rowMeta['bcName']['url']).toStrictEqual({
            errors: {
                a: 'a'
            }
        })
    })
    it('should react on action bcSaveDataFail', () => {
        const nextState = view(
            {
                ...initialState,
                rowMeta: {
                    bcName: {
                        url: null
                    }
                }
            },
            $do.bcSaveDataFail({
                bcName: 'bcName',
                bcUrl: 'url',
                viewError: 'error',
                entityError: { bcName: 'bcName', id: 'id', fields: { a: 'a' } }
            }),
            null
        )
        expect(nextState.rowMeta['bcName']['url']).toStrictEqual({
            errors: {
                a: 'a'
            }
        })
    })
    it('should react on action sendOperationFail', () => {
        const nextState = view(
            {
                ...initialState,
                rowMeta: {
                    bcName: {
                        url: null
                    }
                }
            },
            $do.sendOperationFail({
                bcName: 'bcName',
                bcUrl: 'url',
                viewError: 'error',
                entityError: { bcName: 'bcName', id: 'id', fields: { a: 'a' } }
            }),
            null
        )
        expect(nextState.rowMeta['bcName']['url']).toStrictEqual({
            errors: {
                a: 'a'
            }
        })
    })
    it('should react on action forceActiveRmUpdate', () => {
        const rowMeta: RowMeta = {
            actions: [],
            fields: [
                {
                    key: 'a',
                    forceActive: true,
                    currentValue: 'a'
                },
                {
                    key: 'b',
                    forceActive: true,
                    currentValue: 'b'
                }
            ]
        }
        const nextState = view(
            {
                ...initialState,
                pendingDataChanges: {
                    bcName: {
                        '1': {}
                    }
                }
            },
            $do.forceActiveRmUpdate({
                bcName: 'bcName',
                bcUrl: 'url',
                currentRecordData: { id: '1', vstamp: 1 },
                rowMeta: rowMeta,
                cursor: '1'
            }),
            null
        )
        expect(nextState.rowMeta['bcName']['url']).toStrictEqual(rowMeta)
        // todo add other checks
    })
    // TODO other tests
})
