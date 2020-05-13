# Version 1.13.0

## Features

* Added optional `bcKey` param to the `sendOperation.associate` action, which will be passed in the `bcName`. It is necessary for identifying the backend which BC to use for popup. (#214)
* Add Modal Invoke window for info and error invoke types (#217)

## Fixes

* `Field`: Fixed overwriting the default Ant properties of components. If passed property is not defined then it is removed from commonProps and commonInputProps. (#215)
* Exported ownProps interfaces of all `src/components/ui` components (#219)

# Version 1.12.0

## Features

* New `radio` field type to display radiobutton controls
* Support http codes 409 to warn about conflicting changes and 401 to logout when session expired
* Support `placeholder` property for fields

# Version 1.11.1

## Fixes

* MultivalueField loses BC while screen changing (#197)


# Version 1.11.0

## Features

* :red_circle: [Deprecation warning]: The description format for screen navigation structure will be changed in 2.0.0 [#78](https://github.com/tesler-platform/tesler-ui/issues/78). For the purposes of migration, a new `useViewTabs` hook is introduced:
```tsx
const tabs = useViewTabs(2) // Get tabs for second level menu
return <ul>
    {tabs.map(tab =>
        <li key={tab.url}>
            <a href={tab.url}>{tab.title}</a>
        </li>
    )}
</ul>
```
* `<AssocListPopup />` now have a header showing a list of currently selected tabs (#173).

## Fixes

* `<AssocTable />` should have a functional `selectAll` checkbox (#193).
* Required fields should not restore their previous value when they've been cleared and (#150).
* Missing translation for warning notification (#160).
* `changeLocation` action should respect default screen when type is `RouteType.default` (#186).
* `<TableWidget />` should use respect `readOnly` flag from widgets meta (#189).
* `<TextArea />` should not be recreated on every value change (#191). 


# Version 1.10.0

## Features

* New contract for confirmation postInvokes with two types of confirmation (#170):
  * `confirm` - Simple yes/no confirmation
  * `confirmText` - Confirmation with input for user text that will be send to Tesler API
```ts
/**
 * The action that will be performed after the user confirms it
 *
 * @param type Type of postInvokeConfirm action
 * @param message Title for modal
 * @param messageContent Additional text for modal
 */
export interface OperationPostInvokeConfirm {
    type: OperationPostInvokeConfirmType | string,
    message: string,
    messageContent?: string
}
```

Previous implementation is now deprecated and will be removed in 2.0.0.
* Widget types are now exposed as `data-widget-type`  attribute on default card html node (#174).

## Fixes

* `AssocListPopup` widget opened for `multivalue` field may get out of sync after items removal so the popup and the field erroneously will show different sets of selected items (#171).
* Router does not respect `primaryView` parameter of screen meta during `changeLocation` action (#178).
* Missing `popup` existence check in ajax reposnse catch-handler causing application crash (#180).

## Misc

* Remove unused `groupName`, `newRow`, `break` properties from `WidgetFieldBase` interface as they were never implemented for Tesler

# Version 1.9.1

## Fixes

* Temporary fix for `<Pagination />` component crashing the page with #300 and #310 React invariants after 1.8.4 added i18n tokens (#167).

# Version 1.9.0

## Features

* Add `suffixClassName` property for `<Field />` and `<InteractiveInput />` which is passed to input suffix icon (#152).
* Export `<ColumnTitle />` component (#152).

## Fixes

* `<Field />` component throws console warnings for unknown html properties (#164). 

# Version 1.8.4

## Fixes

* Incorrect condition refactoring fpr required fields check after 1.8.1 may crash the application (#158).
* Missing i18n tokens for `<ColumnTitle />`, `<FileUpload />`, `<Pagination />`, `<PickInput />`, `<Popup />` and `view` reducer (#161).
* `<TableWidget />` column headers should not break words (#162).

# Version 1.8.3

## Fixes

* Drilldown fields crashing the application after 1.8.0 update (#156).

# Version 1.8.2

## Fixes

* Dropdown components not showing their icons after 1.8.1 update.

# Version 1.8.1

## Fixes

* `<ColumnSort />` component frequently crash the application due to missing null checks after 1.4.4 update.
* `@types/antd` and `@types/axios` replaced with devDependencies as they have a potential of breaking client applications build pipe due to referencing latest versions instead of specified as peerDependencies.

## Misc

* Use typescript version 3.8.3
* Use antd version 3.26.13

# Version 1.8.0

## Features

* Table filtration now supports additional field types: `checkbox`, `dictionary`, `date`, `number`, `text`, `pickList`, `multivalue`  (#130).
* Business components now support predefined filtration, so any BC with the set property of `filterGroups`:
```tsx
"filterGroups": [
    { name: 'Example PDQ 1', filters: 'someField1.contains=123' },
    { name: 'Example PDQ 2', filters: 'someField1.contains=321&someField2.equalsOneOf=["Confirmed", "Canceled"]' 
]
```
will try to display predefined filters and fetch the data according to them.
See [FilterGroup class](https://github.com/tesler-platform/tesler/blob/master/tesler-model/tesler-model-ui/src/main/java/io/tesler/model/ui/entity/FilterGroup.java) for usage example (#138).

## Fixes

* Following field types will not be shown as sortable as there is no support for this in Tesler API: `multivalue`, `multivalueHover`, `multifield`, `hidden`, `fileUpload`, `inlinePickList`, `hint` (#130).
* Padding should be consistent for fields with set `backgroundColor` property whenever they are displayed as part of `multifield` or as a separate field (#140).
* When having an unsaved changes on a widget and calling an operation for another widget, autosave procedure should be initiated for the changes (#144).
* Respect `hidden` field type in `<PickListPopup />` (#146).

# Version 1.7.3

## Fixes

* Make a datepicker with an empty value to keep the selected locale (#133).
* Pass hierarchy depth level to custom fields (#135).

# Version 1.7.2

## Fixes

* Widget meta should reuse existing `description` field instead of introducing new `documentation` field to avoid adittional work on Tesler API (#126).
* Post action operation should not try to access row meta when there isn't one (#129).

# Version 1.7.1

## Fixes

* Revert the changes for not sending empty but required forceActive fields introduced in 1.6.0

# Version 1.7.0

## Features

* New `HistoryField` component which will visualize the difference between the current value of the field and the value from field with key specified in `snapshotKey` (and `snapshotFileIdKey` for file fields) of widget meta (#118).
* Multivalue record now supports `snapshotState` field which will containt the status of the record: `new`, `deleted` or `noChange` (#118).
* List widget in hierarchy mode now correctly displays all field types.
* List widget now supports full hierarchy mode.

# Version 1.6.0

## Features

* New `preInvoke` field in operation response, which allows to prompt the user with a confirmation window if he wants to perform another operation (#109)
* New `Clear all filters` functionality (#111)
* Drilldowns now allow to specify the filters which will be applied after drilldown (#111)
* Fetch parent bc data even if there are no corresponding widgets for those parent business components on active view (#113)
* Optional `documentation` field for widget meta which can be used to document widget usage (#116)

## Fixes

* Required fields no longer highlighted when they are left empty and marked as read-only, as it's confusing for user who has no means to resolve this problem for read-only fields (#118).
* Return previous value if field becomes read-only when we change forceActive and send an operation (#118).
* Validation does not work when we click on actions or change forceActive, if the widget has required fields (#118).
* Unfilled required fields are sent to the backend as modified (value=null) (#118).

# Version 1.5.2

## Fixes

* Fix error when custom internationalization language has no matching core dictionary

# Version 1.5.1

## Fixes

* Fix table record menu bugs: stuck button, requesting wrong rowMeta (#87).
    * Row operations button may stuck on record after operation selected and menu is closed
    * Row operations may request wrong rowMeta which leads to incorrect displaying operations and sometime erroneous restore of deleted record
* New action bcFetchDataPages for fetching specific page range of data which should solve the problem of missing pages when working with infinite pagination (#102).
* Remove page reset on table sort (#85).
* `OperationPostInvoke` should allow `type` field to be a string to correctly support custom postInvokes. 

# Version 1.5.0

## Features

* Template strings for field titles: Table and Form widgets now support templated title in form of `Title {token:defaultValue}` string, where `token` is replaced with value of the field with key `token` of the currently selected record. `<TemplatedTitle />` component now exported to support this behaviour is custom widgets (#94).
* `<Pagination />` component now have `onChangePage` callback (#76).

## Fixes

* Hierarchy table should clear active cursor on page change (#76).

## Misc

* Disable check for the presence of `save` action in row meta for autosave middleware until we investigate the cases when this check fails due to missing cursor (#99).

# Version 1.4.4

## Fixes

* Force active fields should not end up in infinite loop when trying to revert changes that were declined by Tesler API (#96).
* Incorrect filtering behaviour:
  * Filters and sorting are not applied for bcLoadMore action (#85)
  * Page is not respected for sorting (#85)
  * Removing filters should reset page (#85)
  * When filtering returns 0 rows, then after clicking on "Reset" button the values ​​in the filter are not reset (#91)
  * Filtering does not work in Picklists (#91)

# Version 1.4.3

## Fixes

* Broken IE11 support due to `markdown` dependency hosted on npm in ES6 format

# Version 1.4.2

## Fixes

* Incorrect `isViewNavigationGroup` safeguard falsy reported true for navigation categories (1.4.0).

# Version 1.4.1

## Fixes

* Broken navigation structure in 1.4.0.

# Version 1.4.0

## Features

* New widget type `Text` supporting markdown syntax (#72).
* Support Tesler API changes for navigation structure (https://github.com/tesler-platform/tesler/issues/18)
* Expand button for hierarchy records now not be showed if there are no children for the record (#76).

## Fixes

* `hidden` field type should not be displayed on `Form`, `List`, `DataGrid` widgets (#73).

# Version 1.3.0

## Features

* Table widget should show drilldown button when cell is in edit mode (#64).
* New record creation should be cancelable from Table widget (#66).

## Fixes

* Required field check crash on autosave caused by drilldown (#63).
* Child elements in the hierarchy should be collapsed by default (#68).
* Changes to HierarchyTable default styling (#68):
  * Decrease the indentation in the TreeData cells from 20px to 15px.
  * Align the first column and "+" on the top edge.
  * Align the data in the 2nd and 3rd columns.

# Version 1.2.2

## Fixes

* Required number fields are erroneously cleared on record create/save and on blur if only zero value entered, due to their incorrect work with `undefined` valudes (#58).

# Version 1.2.1

## Fixes

* Respect default width of columns for hierarchy tables and disable pagination if not required (#56).
* Disable pagination for PickListPopup with FullHierarchy (#55).
* List widget in hierarchy mode should support drilldown field (#51).
* RowMeta request isn`t sent when the forceActive field changes (#53).

# Version 1.2.0

## Features

* PickList widget now supports hierarchy tables, i.e. widget options `hierarchy`, `hierarchySameBc` and `hierarchyFull` now work the same way as in regular Table widgets (#49).
* New `hierarchyDisableRoot: boolean` flag added to control if rows on top of hierarchy are selectablable or not (#49).

# Version 1.1.6

## Fixes

* Fields shouldn't ignore empty delta value (#46).
* Console error, that appears when trying to check force active fields change on full hierarchy BC without data (#47).
* Change location with cursors change should initiate data fetch even if View was not updated (e.g. drilldown on the same View) (#34).
* Changelog incorrectly referenced #34 instead of #32 in 1.1.4 release.

# Version 1.1.5

## Fixes

* Increase indent between multi-value list records (#41)

## Misc

* Add release workflow

# Version 1.1.4

## Fixes

* Remove `limit` and `page` params from full hierarchy data request (#32).
* Fix an infinite loop when a business error is received during a change in a force-active field (#35).

## Misc

* Add pull request pipeline

# Version 1.1.3

## Fixes

* `required` fields validation should be limited to only visible fields, to avoid situations when field is marked as required but user is unable to interact with it (#27).
* `List` widgets erroneously fetched data only for the first level of hierarchy (#25).
* Hierarchy widgets positioned expand icon incorrectly.

# Version 1.1.2

## Fixes

* Page crash after view change due to missing `Set` polyfill for IE11 (#12).
* forceActive fields should not drop all existing validation errors.
* requiredFieldsMiddleware incorrectly checked for effective value which could lead to non-empty fields highlighted as empty.
* Russian translation "Required fields are missing" message fix.
* Webpack config incorrectly referred `LICENSE.MD` instead of `LICENSE`
* Non-working readme links on NPM 

# Version 1.1.1

## Fixes

* Broken npm package

# Version 1.1.0

## Features

* In addition to `inner` drilldowns, new drilldown types were introduced: `relative`, `relativeNew`, `external`, `externalNew`. See `DrillDownType` interface for description.
* Hierarchy-based tables now support full datasource, e.g. all data for hierarchy is fetched in one request, as opposite to a previous hierarchies which fetched data one hierarchy level at a time. See `FullHierarchyTable` for implementation details.
* Table widget now supports `readOnly` flag from widget meta (#8).
* Support `defaultSort` property for business components (#4).
* Support `autoSaveBefore` flag for operations which indicates that before requesting widget operation API `required` fields of that widget should be validated for empty values (#1).

## Fixes

* Validation error should be displayed for input and custom fields when rendered on table widget (#1)
* Restore two missing commits that were lost in initial release (#6):
    * Pending changes should be considered for widget's showCondition calculation 
    * Hierarchy list bug fixes
 
## Misc

* package.json now includes license
* Update contributing guide with corrections for `Branch organization` section
* .md files are now included in npm release

# Version 1.0.0

* Public release
* `[BREAKING CHANGE]` `id` field is removed from widget meta in favor of `name` field (as `id` is autogenerated after every update and unfit for widget-based business logic). All corresponding `widgetId` properties should be replaced with `widgetName` field.
* `View` and `DashboardLayout` no longer require `skipWidgetTypes` property, empty array is provided when missing for `DashboardLayout`.
