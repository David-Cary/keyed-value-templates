export type TypeConversionCallback<F = any, T = any> = (value: F) => T;
export interface TypeConversionOptions<T> {
    default?: T;
}
export type TypeConversionFactory<T = any> = (options?: TypeConversionOptions<T>) => TypeConversionCallback<unknown, T>;
export declare function getConversionToBoolean(options?: TypeConversionOptions<boolean>): TypeConversionCallback<unknown, boolean>;
export interface StringConversionOptions extends TypeConversionOptions<string> {
    useJSON?: boolean;
}
export declare function getConversionToString(options?: StringConversionOptions): TypeConversionCallback<unknown, string>;
export declare const DEFAULT_TYPE_CONVERSIONS: Record<string, TypeConversionFactory>;
