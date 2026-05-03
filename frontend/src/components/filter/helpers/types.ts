export interface FieldOption {
    title: string
    value: string | number
}

export type FilterValues = Record<string, string | number | FieldOption>
