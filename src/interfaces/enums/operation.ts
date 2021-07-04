/**
 * A type of action which fires after user's operation
 */
export enum OperationPostInvokeType {
    /**
     * BC's refresh. It leads to cursor dropping, data refresh of current BC and its children
     */
    refreshBC = 'refreshBC',
    /**
     * File downloading by `fileId` which comes from  answer to user's operation.
     * Вызов сохранения файла в браузере по пришедшему в ответе fileId
     */
    downloadFile = 'downloadFile',
    /**
     * File downloading by `url` which comes from  answer to user's operation.
     * Вызов сохранения файла в браузере по пришедшему в ответе url
     */
    downloadFileByUrl = 'downloadFileByUrl',
    /**
     * Calling a browser transition to some record
     */
    drillDown = 'drillDown',
    /**
     * `Pick list` widget opening
     */
    openPickList = 'openPickList',
    /**
     * @deprecated TODO: Не работает, удалить все упоминания из Досье и убрать всех свидетелей
     *
     */
    // delayedRefreshBC = 'delayedRefreshBC',
    /**
     * Showing pop-up message
     */
    showMessage = 'showMessage',
    /**
     * Инициировать удаление записей
     *
     * @deprecated TODO: Бэк должен сам их удалить и в ответе возвращать список удаленных
     * Не использовать и убрать с Досье, когда определимся с форматом ответов
     */
    postDelete = 'postDelete'
}
