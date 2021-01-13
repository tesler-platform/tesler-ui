import { FieldType } from './view'
import { ConnectedComponent } from 'react-redux'
import { FunctionComponent } from 'react'
import { PickMap, DataValue } from './data'
import { OperationType, OperationInclusionDescriptor } from './operation'

export const enum WidgetTypes {
    Info = 'Info',
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
    Text = 'Text',
    FlatTree = 'FlatTree',
    FlatTreePopup = 'FlatTreePopup'
}

/**
 * Different widget types that are considered `tables` in nature for purposes of applying some shared features.
 * For example, autofocus on missing required field should work for tables but not forms.
 *
 * TODO: Make extension point
 */
export const TableLikeWidgetTypes = [
    WidgetTypes.List,
    WidgetTypes.DataGrid,
    WidgetTypes.AssocListPopup,
    WidgetTypes.PickListPopup,
    WidgetTypes.FlatTree,
    WidgetTypes.FlatTreePopup
] as const

/**
 * Widgets that are considered `popups` and usually excluded from widgets layout grid
 *
 * TODO: Make extenstion point
 */
export const PopupWidgetTypes = [WidgetTypes.PickListPopup, WidgetTypes.AssocListPopup, WidgetTypes.FlatTreePopup] as const

/**
 * All widget types that display table-like data
 */
type TableLikeWidgetType = typeof TableLikeWidgetTypes[number]

export interface WidgetFieldBase {
    type: FieldType
    key: string
    drillDown?: boolean
    bgColor?: string
    bgColorKey?: string
    label?: string
    snapshotKey?: string
    /**
     * Maximum number of characters
     */
    maxInput?: number
    /**
     * Whether the field is hidden
     */
    hidden?: boolean
    /**
     * Shift value of different hierarchy level
     */
    hierarchyShift?: boolean
    drillDownKey?: string
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
    multiple?: boolean
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
    type: FieldType.multivalue | FieldType.multivalueHover
    popupBcName?: string
    assocValueKey?: string
    associateFieldKey?: string
    displayedKey?: string
}

export type PickListFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.pickList
    popupBcName: string
    pickMap: PickMap
}

export type InlinePickListFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.inlinePickList
    searchSpec: string
    popupBcName: string
    pickMap: PickMap
}

export type FileUploadFieldMeta = AllWidgetTypeFieldBase & {
    type: FieldType.fileUpload
    fileIdKey: string
    fileSource: string
    snapshotFileIdKey?: string
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

/**
 * Field descriptor in widget configuration
 */
export type WidgetField =
    | NumberFieldMeta
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
 *
 */
export type WidgetInfoField = WidgetFormField & {
    drillDownTitle?: string
    drillDownTitleKey?: string
    hintKey?: string
}

export interface WidgetInfoOptions {
    fieldBorderBottom?: boolean
    footer?: string
}

/**
 * @param readOnly All widget fields are not editable
 * @param tableOperations Options for allowed on table widget actions
 */
export interface WidgetOptions {
    layout?: {
        header?: string[]
        aside?: string[]
        rows: LayoutRow[]
    }
    /**
     * Options for allowed on table widget actions
     */
    tableOperations?: TableOperations
    /**
     * TODO: Move all hierarchy-specific properties to a single property
     */
    hierarchy?: WidgetTableHierarchy[]
    hierarchySameBc?: boolean
    hierarchyFull?: boolean
    hierarchyParentKey?: string
    hierarchyGroupSelection?: boolean
    hierarchyGroupDeselection?: boolean
    hierarchyTraverse?: boolean
    hierarchyRadio?: boolean
    hierarchyRadioAll?: boolean
    hierarchyDisableRoot?: boolean
    /**
     * Disable searched item descendants in fullHierarchy search
     */
    hierarchyDisableDescendants?: boolean
    hierarchyDisableParent?: boolean
    actionGroups?: WidgetOperations
    /**
     * All widget fields are not editable
     */
    readOnly?: boolean
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of actionGroups
     */
    hideActionGroups?: string[]
    /**
     * Record field which value will be used as a title for the whole record
     * for this particular widget
     */
    displayedValueKey?: string
    /**
     * Disable tooltip with error text
     */
    disableHoverError?: boolean
    /**
     * Disable notification after failed operation
     */
    disableNotification?: boolean
    /**
     * Allow selecting multiple items for FlatListPopup
     *
     * TODO: Move to separate interface
     */
    multiple?: boolean
}

export interface WidgetMeta {
    name: string
    type: WidgetTypes | string // TODO: Как учитывать типы клиентских виджетов кроме string?
    title: string // отображаемое название,
    bcName: string
    position: number
    limit?: number
    gridWidth: number // 1-24
    fields: unknown[]
    options?: WidgetOptions
    showCondition?: WidgetShowCondition
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
    bcName: string
    isDefault: boolean
    params: {
        fieldKey: string
        value: DataValue
    }
}

/**
 * Description of the list of fields of block type.
 *
 * @deprecated Used to create a block grouping of fields
 */
export interface WidgetFieldBlock<T> {
    /**
     * Block ID
     */
    blockId: number
    /**
     * Name of the block
     */
    name: string
    /**
     * Fields contained in the block
     */
    fields: T[]
    /**
     * @deprecated TODO: Remove in 2.0.0, used to denote a new row in old layout system for forms
     */
    newRow?: boolean
    /**
     * @deprecated TODO: Remove in 2.0.0, used to ...
     */
    break?: boolean
}

export type WidgetFieldsOrBlocks<T> = Array<T | WidgetFieldBlock<T>>

/**
 * Configuration for widgets dislaying form data
 */
export interface WidgetFormMeta extends WidgetMeta {
    /**
     * Unambiguous marker for JSON file specifing widget type
     */
    type: WidgetTypes.Form
    /**
     * Descriptor for fields or block of fields on the form
     */
    fields: WidgetFieldsOrBlocks<WidgetFormField>
}

/**
 * Configuration for widgets displaying table-like data
 */
export interface WidgetTableMeta extends WidgetMeta {
    /**
     * Unambiguous marker for JSON file specifing widget type
     */
    type: TableLikeWidgetType
    /**
     * Descriptor for table columns
     */
    fields: WidgetListField[]
}

/**
 * Configuration for widgets displaying read-only table data
 */
export interface WidgetInfoMeta extends WidgetMeta {
    /**
     * Unambiguous marker for JSON file specifing widget type
     */
    type: WidgetTypes.Info
    /**
     * Descriptor for fields or block of fields on the form
     */
    fields: WidgetFieldsOrBlocks<WidgetInfoField>
    /**
     * Options for customizing widget
     */
    options?: WidgetOptions & WidgetInfoOptions
}

/**
 * Configuration for widgets displaying markdown text
 */
export interface WidgetTextMeta extends WidgetMeta {
    /**
     * Unambiguous marker for JSON file specifing widget type
     */
    type: WidgetTypes.Text
    /**
     * Text to display
     */
    description: string
    /**
     * Title text
     */
    descriptionTitle: string
}

/**
 * A widget configuration of any known type
 */
export type WidgetMetaAny = WidgetFormMeta | WidgetTableMeta | WidgetTextMeta | WidgetInfoMeta

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
 */
export interface TableOperations {
    /**
     * Describes position of tableOperations relatively of table
     */
    position?: PositionTypes
}

/**
 * Configuration descriptor for hierarchy subset of table widgets.
 *
 * Each descriptor describes a specific level of hierarchy
 */
export interface WidgetTableHierarchy {
    /**
     * Which business component is displayed on this level
     */
    bcName: string
    /**
     * What record field to use as displayed value of that record
     */
    assocValueKey?: string
    /**
     * If true only one item can be selected
     */
    radio?: boolean
    /**
     * Fields that will be displayed on this hierarchy level
     */
    fields: WidgetListField[]
}

/**
 * Operations description in `options` of widget meta, which allows its availability.
 */
export interface WidgetOperations {
    /**
     * List of included operations or groups of operations
     */
    include?: OperationInclusionDescriptor[]
    /**
     * List of excluded operations or groups of operations
     */
    exclude?: OperationType[]
    /**
     * default no crud save action
     */
    defaultSave?: string
}

/**
 * Description of the interface for WidgetOptions's layout.rows
 */
export interface LayoutCol {
    fieldKey: string
    span?: number
}

/**
 * Description of the interface for LayoutRow
 */
export interface LayoutRow {
    cols: LayoutCol[]
}

export type CustomWidget = ConnectedComponent<any, any> | FunctionComponent<any>

export type CustomWidgetDescriptor =
    | CustomWidget
    | {
          component: CustomWidget
          card?: CustomWidget
      }

/**
 * Check if descriptor is just a widget, or it has additional data
 */
export function isCustomWidget(descriptor: CustomWidgetDescriptor): descriptor is CustomWidget {
    return !!descriptor && !('component' in descriptor)
}

/**
 * TODO
 *
 * @param item
 */
export function isWidgetFieldBlock(item: any): item is WidgetFieldBlock<any> {
    return !!item && 'blockId' in item
}

/**
 * Type of pagination, either page numbers or "Load More" button
 */
export const enum PaginationMode {
    page = 'page',
    loadMore = 'loadMore'
}
