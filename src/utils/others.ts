import { FieldType, MultivalueFieldMeta, PickListFieldMeta } from '@tesler-ui/schema'

export function isMultivalueField(fieldType: FieldType) {
    const isPickList = fieldType === FieldType.pickList

    return [FieldType.multivalue, FieldType.multivalueHover].includes(fieldType) || isPickList
}

export function getPopupAssocKeys(fieldMeta: MultivalueFieldMeta | PickListFieldMeta) {
    const isPickList = fieldMeta.type === FieldType.pickList

    let currentFieldMeta
    let assocValueKey: string
    let associateFieldKey: string

    if (isPickList) {
        currentFieldMeta = fieldMeta as PickListFieldMeta

        assocValueKey = currentFieldMeta.pickMap[fieldMeta.key]
        associateFieldKey = currentFieldMeta.key
    }

    if (!isPickList) {
        currentFieldMeta = fieldMeta as MultivalueFieldMeta

        assocValueKey = currentFieldMeta.assocValueKey
        associateFieldKey = currentFieldMeta.associateFieldKey
    }

    return {
        assocValueKey,
        associateFieldKey
    }
}
