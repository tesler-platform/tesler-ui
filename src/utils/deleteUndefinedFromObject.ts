export function deleteUndefinedFromObject(obj: Record<string, any>) {
    Object.keys(obj).forEach(key => {
        if (obj[key] === undefined) {
            delete obj[key]
        }
    })
}
