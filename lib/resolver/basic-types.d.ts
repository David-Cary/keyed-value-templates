export type KeyValueMap = Record<string, unknown>;
export type AnyObject = KeyValueMap | unknown[];
export type TypeConversionCallback<F = any, T = any> = (value: F) => T;
