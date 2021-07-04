/**
 * Describes format of `pendingValidationFails`
 * TODO remove in 2.0.0
 */
export enum PendingValidationFailsFormat {
    old = 'old',
    target = 'target'
}

export enum ApplicationErrorType {
    BusinessError,
    SystemError,
    NetworkError
}
