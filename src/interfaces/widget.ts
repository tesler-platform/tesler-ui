import {FieldType} from '../interfaces/view'
import {ConnectedComponent} from 'react-redux'
import {FunctionComponent} from 'react'
import {PickMap, DataValue} from './data'
import {OperationType, OperationInclusionDescriptor} from './operation'

export const enum WidgetTypes {
    Form = 'Form',
    List = 'List',
    DataGrid = 'DataGrid',
    AssocListPopup = 'AssocListPopup',
    PickListPopup = 'PickListPopup',
    HeaderWidget = 'HeaderWidget',
    SecondLevelMenu = 'SecondLevelMenu',
    ThirdLevelMenu = 'ThirdLevelMenu',
    FourthLevelMenu = 'FourthLevelMenu',
    WidgetCreator = 'WidgetCreator',
    Pivot = 'Pivot',
    DimFilter = 'DimFilter',
    Text = 'Text'
}

/**
 * Different widget types that are considered `tables` in nature for purposes of applying some shared features.
 * For example, autofocus on missing required field should work for tables but not forms.
 */
export const TableLikeWidgetTypes: Array<WidgetTypes | string> = [
    WidgetTypes.List,
    WidgetTypes.DataGrid,
    WidgetTypes.AssocListPopup,
    WidgetTypes.PickListPopup
]

/**
 * @param maxInput Maximum number of characters
 * @param hidden Whether the field is hidden
 */
export interface WidgetFieldBase {
    type: FieldType,
    key: string,
    drillDown?: boolean,
    bgColor?: string,
    bgColorKey?: string,
    label?: string,
    snapshotKey?: string,
    maxInput?: number,
    hidden?: boolean
}

export interface WidgetListFieldBase extends WidgetFieldBase {
    title: string
    width?: number
}

export interface WidgetFormFieldBase extends WidgetFieldBase {
    label: string
}

export type AllWidgetTypeFieldBase = WidgetFormFieldBase | WidgetListFieldBase

export type NumberFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.number | FieldType.money | FieldType.percent
    digits?: number
    nullable?: boolean
}

export type DateFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.date
}

export type CheckboxFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.checkbox
}

export type DateTimeFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.dateTime
}

export type DateTimeWithSecondsFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.dateTimeWithSeconds
}

export type DictionaryFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.dictionary
    dictionaryName?: string
}

export type TextFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.text
    popover?: boolean
}

export type InputFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.input | FieldType.hint
}

export type MultiFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.multifield
    fields: WidgetField[]
    style: 'inline' | 'list'
}

export type MultivalueFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.multivalue | FieldType.multivalueHover,
    popupBcName?: string,
    assocValueKey?: string,
    associateFieldKey?: string,
    displayedKey?: string,
}

export type PickListFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.pickList,
    popupBcName: string,
    pickMap: PickMap
}

export type InlinePickListFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.inlinePickList,
    searchSpec: string,
    popupBcName: string,
    pickMap: PickMap
}

export type FileUploadFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.fileUpload,
    fileIdKey: string,
    fileSource: string,
    snapshotFileIdKey?: string,
}

/**
 * @deprecated TODO: Remove in 2.0.0 in favor of `hidden` flag of widget meta field description
 */
export type HiddenFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.hidden
}

export type RadioButtonFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.radio
}

export type WidgetField = NumberFieldMeta
    | DateFieldMeta
    | DateTimeFieldMeta
    | DateTimeWithSecondsFieldMeta
    | DictionaryFieldMeta
    | TextFieldMeta
    | MultiFieldMeta
    | InputFieldMeta
    | MultivalueFieldMeta
    | PickListFieldMeta
    | InlinePickListFieldMeta
    | FileUploadFieldMeta
    | CheckboxFieldMeta
    | HiddenFieldMeta
    | RadioButtonFieldMeta

export type WidgetFormField = Extract<WidgetField, WidgetFormFieldBase>

export type WidgetListField = Extract<WidgetField, WidgetListFieldBase>

/**
 * @param readOnly All widget fields are not editable
 * @param tableOperations Options for allowed on table widget actions
 */
export interface WidgetOptions {
    layout?: {
        header?: string[],
        aside?: string[],
        rows: Array<{
            cols: Array<{fieldKey: string, span?: number}>
        }>
    },
    tableOperations?: TableOperations,
    /**
     * TODO: Move all hierarchy-specific properties to a single property
     */
    hierarchy?: WidgetTableHierarchy[],
    hierarchySameBc?: boolean,
    hierarchyFull?: boolean,
    hierarchyParentKey?: string,
    hierarchyGroupSelection?: boolean,
    hierarchyGroupDeselection?: boolean,
    hierarchyTraverse?: boolean,
    hierarchyRadio?: boolean,
    hierarchyRadioAll?: boolean,
    hierarchyDisableRoot?: boolean,
    hierarchyDisableParent?: boolean,
    actionGroups?: WidgetOperations,
    readOnly?: boolean,
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of actionGroups
     */
    hideActionGroups?: string[],
    /**
     * Record field which value will be used as a title for the whole record
     * for this particular widget
     */
    displayedValueKey?: string
}

export interface WidgetMeta {
    name: string,
    type: WidgetTypes | string, // TODO: Как учитывать типы клиентских виджетов кроме string?
    title: string, // отображаемое название,
    bcName: string,
    position: number,
    limit?: number,
    gridWidth: number, // 1-24
    fields: object[],
    options?: WidgetOptions,
    showCondition?: WidgetShowCondition,
    description?: string // description for documentation
}

/**
 * Show widget only if certain condition is met
 *
 * Supported conditions:
 * - Active record for specified business component {bcName} should contain field {fieldKey}
 * with value {fieldValue}
 *
 * @param bcName Business component where field condition is checked
 * @param fieldCondition Field key and value expected from this field
 */
export interface WidgetShowCondition {
    bcName: string,
    isDefault: boolean,
    params: {
        fieldKey: string,
        value: DataValue
    }
}

/**
 * Description of the list of fields of block type.
 * @deprecated
 * Used to create a block grouping of fields
 *
 * @param blockId Block ID.
 * @param name The name of the block.
 * @param Fields an array of fields of type T.
 */
export interface WidgetFieldBlock<T> {
    blockId: number,
    name: string,
    fields: T[],
    newRow?: boolean,
    break?: boolean,
}

export type WidgetFieldsOrBlocks<T> = Array<T | WidgetFieldBlock<T>>

export interface WidgetFormMeta extends WidgetMeta {
    type: WidgetTypes.Form
    fields: WidgetFieldsOrBlocks<WidgetFormField>
}

export interface WidgetTableMeta extends WidgetMeta {
    type: WidgetTypes.List | WidgetTypes.DataGrid,
    fields: WidgetListField[]
}

/**
 * Description of possible positioning options
 */
export const enum PositionTypes {
    Top = 'Top',
    Bottom = 'Bottom',
    TopAndBottom = 'TopAndBottom'
}

/**
 * Description of options of allowed on table widget actions
 * @param position Describes position of tableOperations relatively of table
 */
export interface TableOperations {
    position?: PositionTypes
}

/**
 * ReactComponent here is just a union representing a component, so you say
 * "our ColumnTitle can get some external React component as long as it have the same props contract
 * and so can use it instead of our default implementation
 */
export type ReactComponent<props> = ConnectedComponent<any, props> | FunctionComponent<props>

export interface WidgetTableHierarchy {
    bcName: string,
    assocValueKey?: string,
    radio?: boolean,
    fields: WidgetListField[]
}

/**
 * Description of the interface for the widget displaying text with support for markdowns
 * @param description Text to display
 * @param descriptionTitle Title
 */

export interface WidgetTextMeta extends WidgetMeta {
    type: WidgetTypes.Text,
    description: string,
    descriptionTitle: string
}

/**
 * Описание операций в опциях меты виджета, через который можно настраивать их доступность
 *
 * @param include Список включаемых операций или групп операций
 * @param exclude Список исключаемых операций или групп операций
 */
export interface WidgetOperations {
    include?: OperationInclusionDescriptor[],
    exclude?: OperationType[]
}

export type CustomWidget = ConnectedComponent<any, any> | FunctionComponent<any>

/**
 * TODO
 * 
 * @param item
 */
export function isWidgetFieldBlock(item: any): item is WidgetFieldBlock<any> {
    return !!item && ('blockId' in item)
}

/**
 * Type of pagination, either page numbers or "Load More" button
 */
export const enum PaginationMode {
    page = 'page',
    loadMore = 'loadMore'
}
