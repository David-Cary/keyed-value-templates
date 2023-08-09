import { type KeyedTemplateResolver, type KeyedTemplateDirective, type TemplateOptimizationResult } from '../resolver/template-resolver';
import { type KeyValueMap, type TypeConversionCallback } from '../resolver/basic-types';
/**
 * This simply wraps a value in an object.
 * @template T
 * @interface
 * @property {T} value - value to be wrapped
 */
export interface ValueWrapper<T = unknown> {
    value: T;
}
/**
 * This directive tries to convert the provided value to a function.
 * This is especially useful if triggering an object function that uses a callback.
 * @class
 * @implements {KeyedTemplateDirective<ValueWrapper>}
 */
export declare class CallbackDirective implements KeyedTemplateDirective<ValueWrapper> {
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): ValueWrapper;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
    /**
     * Converts the provided value to a function.
     * If a context and resolver are provided, this resolves the value as a template.
     * This resolution uses a local context with '$args' as a local variable, allowing access to the invoked arguments.
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap | undefined} context - extra data to be made available for resolution
     * @param {KeyedTemplateResolver | undefined} resolver - template resolver to be used
     * @returns {() => unknown} provided value as a function
     */
    castToFunction(value: unknown, context?: KeyValueMap, resolver?: KeyedTemplateResolver): () => unknown;
}
/**
 * Includes both a value and possible types it can be converted to.
 * @interface
 * @property {unknown} value - value to be converted
 * @property {string[]} as - list of acceptable type strings
 */
export interface TypeConversionParams extends ValueWrapper {
    as: string[];
}
/**
 * Provides a collection of conversion callbacks from an unknown value to particular types, keyed by the name of each of those types.
 * @constant {Record<string, TypeConversionCallback>}
 */
export declare const DEFAULT_UNKNOWN_TO_TYPE_CONVERSIONS: Record<string, TypeConversionCallback>;
/**
 * This directive tries converting the provided value to the specified type.
 * @class
 * @implements {KeyedTemplateDirective<TypeConversionParams>}
 * @property {Record<string, TypeConversionCallback>} callbacks - map of conversion functions to use, keyed by type name
 */
export declare class TypeConversionDirective implements KeyedTemplateDirective<TypeConversionParams> {
    readonly callbacks: Record<string, TypeConversionCallback>;
    protected _functionCaster: CallbackDirective;
    constructor(callbacks?: Record<string, TypeConversionCallback>);
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): TypeConversionParams;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
    /**
     * Converts the target value to one of the provided types.
     * If the value is one of the provided types, no conversion takes place.  Otherwise, the first type listed is used.
     * Note that this falls back on using a CallbackDirective for functions if no specific handler for that type is provided.
     * Said CallbackDirective will use the provided context and resolver to generate the resulting function.
     * @function
     * @param {unknown} value - value to be converted
     * @param {string[]} types - names of acceptable types
     * @param {KeyValueMap | undefined} context - extra data to be made available for resolution
     * @param {KeyedTemplateResolver | undefined} resolver - template resolver to be used
     * @returns {unknown} converted value
     */
    castValueAs(value: unknown, types: string[], context?: KeyValueMap, resolver?: KeyedTemplateResolver): unknown;
    /**
     * Adds 'array' and 'null' to 'typeof' resolution.
     * @function
     * @param {unknown} value - value to be evaluated
     * @returns {string} name of the resolved type
     */
    getExpandedTypeOf(value: unknown): string;
}
/**
 * This directive wraps the provided value, returning an exact copy of the target value without resolving it.
 * This lets you use this to wrap other directive and protect them from execution.
 * @class
 * @implements {KeyedTemplateDirective<ValueWrapper>}
 */
export declare class LiteralValueDirective implements KeyedTemplateDirective<ValueWrapper> {
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): ValueWrapper;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
    optimizeTemplate(params: KeyValueMap, resolver: KeyedTemplateResolver): TemplateOptimizationResult;
}
/**
 * This directive performs 2 passes of resolution on the target value.
 * This lets it execute the value of a literal directive, circumventing their usual protection.
 * @class
 * @implements {KeyedTemplateDirective<ValueWrapper>}
 */
export declare class ResolveValueDirective implements KeyedTemplateDirective<ValueWrapper> {
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): ValueWrapper;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
}
