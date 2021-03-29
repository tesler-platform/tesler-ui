import { WidgetShowCondition, WidgetTypes, WidgetOptions, WidgetFormField, WidgetListField, WidgetInfoField } from '@tesler-ui/schema'
import { ConnectedComponent } from 'react-redux'
import { FunctionComponent } from 'react'
export {
    WidgetShowCondition,
    WidgetTypes,
    WidgetOptions,
    LayoutRow,
    LayoutCol,
    WidgetOperations,
    TableOperations,
    PositionTypes,
    WidgetTableHierarchy,
    WidgetFieldBase,
    WidgetListFieldBase,
    WidgetFormFieldBase,
    AllWidgetTypeFieldBase,
    NumberFieldMeta,
    DateFieldMeta,
    CheckboxFieldMeta,
    DateTimeFieldMeta,
    DateTimeWithSecondsFieldMeta,
    DictionaryFieldMeta,
    TextFieldMeta,
    InputFieldMeta,
    MultiFieldMeta,
    MultivalueFieldMeta,
    PickListFieldMeta,
    InlinePickListFieldMeta,
    FileUploadFieldMeta,
    WidgetFormField,
    WidgetListField,
    HiddenFieldMeta,
    RadioButtonFieldMeta,
    WidgetField,
    WidgetInfoField
} from '@tesler-ui/schema'

/**
 * Different widget types that are considered `tables` in nature for purposes of applying some shared features.
 * For example, autofocus on missing required field should work for tables but not forms.
 *
 * TODO: Make extension point
 *
 * @category Components
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
 */
export const PopupWidgetTypes: string[] = [WidgetTypes.PickListPopup, WidgetTypes.AssocListPopup, WidgetTypes.FlatTreePopup]

/**
 * All widget types that display table-like data
 */
type TableLikeWidgetType = typeof TableLikeWidgetTypes[number]

export interface WidgetInfoOptions {
    fieldBorderBottom?: boolean
    footer?: string
}

export interface WidgetMeta {
    name: string
    type: WidgetTypes | string // TODO: Как учитывать типы клиентских виджетов кроме string?
    title: string // отображаемое название,
    bcName: string
    /**
     * Business components ancestors hierarchy
     *
     * TODO: Will be mandatory (but nullable) in 2.0.0
     *
     * It is declared in `WidgetDTO` of Tesler API, can be null for widgets without
     * business component (headers, navigation tabs, etc.)
     */
    url?: string | null
    position: number
    limit?: number
    gridWidth: number // 1-24
    fields: unknown[]
    options?: WidgetOptions
    showCondition?: WidgetShowCondition
    description?: string // description for documentation
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
 * Component of custom widget
 */
export type CustomWidget = ConnectedComponent<any, any> | FunctionComponent<any>

/**
 * Configuration of custom widget
 */
export interface CustomWidgetConfiguration {
    /**
     * Whether widget is popup
     */
    isPopup?: boolean
    /**
     * Component of custom widget
     */
    component: CustomWidget
    /**
     * Card of widget
     */
    card?: CustomWidget
}

export type CustomWidgetDescriptor = CustomWidget | CustomWidgetConfiguration
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
 * @category Type Guards
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
