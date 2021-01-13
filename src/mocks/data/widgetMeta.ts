/**
 * Моки меты виджетов
 */
import { WidgetTypes, WidgetMeta } from '../../interfaces/widget'
import { FieldType } from '../../interfaces/view'

export const baseWidgetMeta: WidgetMeta = {
    name: 'mockWidget',
    bcName: 'selfEsteemList',
    position: 0,
    gridWidth: 0,
    title: null,
    type: WidgetTypes.Form,
    fields: [
        {
            blockId: '1',
            fields: [
                {
                    key: 'subProcessInfo',
                    label: 'Подпроцесс',
                    type: 'multivalue'
                }
            ]
        }
    ]
}

/**
 * Виджет-иерархия, на первом уровне риски, на втором меры, на третьем последствия
 */
export const hierarchyWidgetMeta: any = {
    id: '20000',
    name: '20000',
    bcName: 'selfEsteemRisk',
    position: 0,
    gridWidth: 0,
    title: 'Иерархия',
    type: WidgetTypes.AssocListPopup,
    options: {
        hierarchyGroupSelection: false,
        hierarchyTraverse: true,
        hierarchyRadio: true,
        hierarchy: [
            {
                bcName: 'riskResponse',
                assocValueKey: 'name',
                radio: true,
                fields: [
                    {
                        key: 'name',
                        title: 'Название',
                        type: FieldType.input
                    }
                ]
            },
            {
                bcName: 'riskResponseMainConsequence',
                assocValueKey: 'name',
                fields: [
                    {
                        key: 'name',
                        title: 'Название',
                        type: FieldType.input
                    }
                ]
            }
        ]
    },
    fields: [
        {
            key: 'name',
            title: 'Название',
            type: FieldType.input
        },
        {
            key: 'riskZone',
            title: 'Зоны риска',
            type: FieldType.multifield,
            fields: [
                {
                    key: 'presentRiskZoneCd',
                    title: 'Зона присущего риска',
                    type: FieldType.dictionary,
                    bgColor: '#E6E6E6'
                },
                {
                    key: 'residualRiskZoneCd',
                    title: 'Зона остаточного риска',
                    type: FieldType.dictionary,
                    bgColor: '#E6E6E6'
                }
            ]
        }
    ]
}

export const hierarchyWidgetProps: any = {
    // TableWidgetProps
    cursor: '9',
    loading: false,
    route: {},
    data: [],
    onDrillDown: undefined,
    onExpand: undefined,
    meta: hierarchyWidgetMeta,
    rowMetaFields: []
}
