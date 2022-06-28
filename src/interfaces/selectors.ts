export type SimpleSelectProps = {
    /**
     * Business component name
     */
    bcName: string
}

export type RowMetaSelectProps = SimpleSelectProps & {
    /**
     * If result hierarchy should include target bc or only ancestors
     *
     * @default true
     */
    includeSelf?: boolean
}
