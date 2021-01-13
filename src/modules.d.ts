declare module '*.less' {
    const styles: { [className: string]: string }
    export = styles
}

declare module '*.svg' {
    const xmlSource: string
    export = xmlSource
}

declare module '*.json' {
    const jsonSource: Record<string, any>
    export = jsonSource
}
