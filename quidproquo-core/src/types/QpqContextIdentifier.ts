export interface QpqContextIdentifier<T> {
    uniqueName: string,
    defaultValue: T
}

export type QpqContext<T> = Record<QpqContextIdentifier<T>['uniqueName'], T>;