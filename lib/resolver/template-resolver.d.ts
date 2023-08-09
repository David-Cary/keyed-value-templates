import { type KeyValueMap, type TypeConversionCallback } from './basic-types';
/**
 * These are used to attach additional data to the results of trying to optimize a template item.
 * @interface
 * @property {value} unknown - optimized version of the target item
 * @property {boolean} executable - signals whether the returned value should be used by another directive
 */
export interface TemplateOptimizationResult {
    value: unknown;
    executable: boolean;
}
export type TemplateOptimizationCallback = (params: KeyValueMap, resolver: KeyedTemplateResolver) => TemplateOptimizationResult;
/**
 * Directives provide special processing and conversion to target objects based on the type of directive.
 * @interface
 * @template P, R
 */
export interface KeyedTemplateDirective<P = unknown, R = unknown> {
    readonly paramsSchema?: KeyValueMap;
    readonly returnSchema?: KeyValueMap;
    /**
     * Performs typecasting and a first pass of initialization on a provided key value map.
     * @function
     * @param {KeyValueMap} params - key value map to be converted
     * @param {KeyValueMap} context - map of values to be used in initialization
     * @param {KeyedTemplateResolver} resolver - template resolver to be used in initialization
     * @returns {P} Converted and initialized version of the provided parameters
     */
    processParams?: (params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver) => P;
    /**
     * Tries to extract a particular value based on the provided parameters and context.
     * @function
     * @param {KeyValueMap} params - parameters for the extraction process
     * @param {KeyValueMap} context - additional data and functionality made available to the process
     * @param {KeyedTemplateResolver} resolver - template resolver to be used by the process
     * @returns {R} results of performing the process on the provided data
     */
    execute: (params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver) => R;
    /**
     * Optional function that signals this directive should receive special handling during optimization.
     * @function
     * @param {KeyValueMap} params - values to be optimized
     * @param {KeyedTemplateResolver} resolver - template resolver requesting the optimization
     * @returns {TemplateOptimizationResult} optimized value and whether or not it should be used in further optimization
     */
    optimizeTemplate?: TemplateOptimizationCallback;
}
/**
 * Used to mark a value as a potential directive request, presumably one that resolved to the target type.
 * @template T
 * @type {KeyValueMap | T}
 */
export type ReplacableValue<T> = KeyValueMap | T;
/**
 * This lets you treat all properties of an object as potential directive requests.
 * @template T
 * @type {KeyValueMap | T}
 */
export type KeyedValueTemplate<T> = {
    [Property in keyof T]: ReplacableValue<T[Property]>;
};
/**
 * These resolvers provide a suite of utility functions for converting keyed template objects to their intended values for a particular context.
 * In this case, a keyed template is an object with a specified property that not only indicates the object should be processes, but also what process should be used to convert it.
 * @class
 * @property {Record<string, KeyedTemplateDirective>} directives - map of directives to use for a particular key.
 * @property {string} directivesKey - property to be treated as an object template marker (defaults to '$use')
 * @property {string} localVariablesKey - property to be attach to a local context for storing local variables (defaults to '$vars')
 */
export declare class KeyedTemplateResolver {
    readonly directives: Record<string, KeyedTemplateDirective>;
    readonly directivesKey: string;
    readonly localVariablesKey: string;
    constructor(directives?: Record<string, KeyedTemplateDirective>, directivesKey?: string, localVariablesKey?: string);
    /**
     * Resolves all template objects in the provided value.
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {unknown} version of the value with templates resolved
     */
    resolveValue(value: unknown, context?: KeyValueMap): unknown;
    /**
     * Resolves the target as a template and converts the results to a particular type.
     * @template T
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @param {TypeConversionCallback<unknown, T>} convertor - callback used to convert the results
     * @returns {T} converted and resolved version of the provided value
     */
    resolveTypedValue<T>(value: unknown, context: KeyValueMap, convertor: TypeConversionCallback<unknown, T>): T;
    /**
     * Resolves all template objects in a given array.
     * @function
     * @param {unknown} value - array to be processed
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {unknown[]} array of converted objects
     */
    resolveValues(value: unknown[], context?: KeyValueMap): unknown[];
    /**
     * Resolves the items in an array and converts them to a particular type.
     * @template T
     * @function
     * @param {unknown} value - array to be processed
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @param {TypeConversionCallback<unknown, T>} convertor - callback used to convert the results
     * @returns {T[]} converted and resolved version of the provided array's contents
     */
    resolveTypedValues<T>(value: unknown[], context: KeyValueMap, convertor: TypeConversionCallback<unknown, T>): T[];
    /**
     * Tries to resolve an object as a possible template, then tries to resolve the object's property values.
     * @function
     * @param {unknown} value - object to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {unknown} version of the object with templates resolved
     */
    resolveObject(value: KeyValueMap, context?: KeyValueMap): unknown;
    /**
     * Tries to resolve an object as a possible template, but leaves any resulting property values alone.
     * @function
     * @param {unknown} value - object to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {unknown} results of processing the object as a template
     */
    executeObjectDirective(value: KeyValueMap, context?: KeyValueMap): unknown;
    /**
     * Retrieves the directive that would be used if the target object were treated as a template.
     * @function
     * @param {unknown} value - object to be evaluated
     * @returns {KeyedTemplateDirective | undefined} directive to be used, if any
     */
    getObjectDirective(value: KeyValueMap): KeyedTemplateDirective | undefined;
    /**
     * Retrieves the key for the directive that would be used if the target value were treated as a template.
     * @function
     * @param {unknown} value - value to be evaluated
     * @returns {string | undefined} key for the appropriate directive, if any
     */
    getDirectiveIdFor(value: unknown): string | undefined;
    /**
     * Tries to resolve a value as a possible template.  If the result is an object, the properties do not in turn get resolved.
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {unknown} results of processing the value as a template
     */
    executeDirectiveFor(value: unknown, context?: KeyValueMap): unknown;
    /**
     * Casts the results of template resolution to an array.
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {unknown[]} the resolved value either as an array or wrapped in an array
     */
    getArray(value: unknown, context?: KeyValueMap): unknown[];
    /**
     * Casts the results of template resolution to a typed array.
     * @template T
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @param {TypeConversionCallback<unknown, T>} convertor - callback used to convert each item
     * @returns {T[]} the resolved value either as a typed array or wrapped in such an array
     */
    getTypedArray<T>(value: unknown, context: KeyValueMap, convertor: TypeConversionCallback<unknown, T>): T[];
    /**
     * Resolved all contents of the target as templates and packages the results in an array.
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {unknown[]} array of all resolved values
     */
    resolveAsArray(value: unknown, context?: KeyValueMap): unknown[];
    /**
     * Resolves the target as a template and converts the results to a key value map.
     * For strings, this wraps them in an object where the key and value are the same.
     * Any results that can't be treated that way wrap the results as the object's 'value' property.
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {KeyValueMap} resolved value as a key value map
     */
    getValueMap(value: unknown, context?: KeyValueMap): KeyValueMap;
    /**
     * Produces a deep copy of the target value, ignoring all directive markers.
     * This means all objects in the copy are themselves copies, meaning they can altered without affecting the original.
     * Note that this does not currently apply to functions.  For those only the referennce is copied, so copy will continue to use functions of the original.
     * @function
     * @param {unknown} source - value to be copied
     * @returns {unknown} deep copy of the source
     */
    createDeepCopy(source: unknown): unknown;
    /**
     * Retrieves a version of the template with context independent members already processed.
     * This should result in faster processing when the context is applied as some values are precalculated.
     * @function
     * @param {unknown} template - value to preprocessed
     * @returns {TemplateOptimizationResult} optimized version of the provided template and whether the results can themselves be used in further optimization
     */
    optimizeTemplate(template: unknown): TemplateOptimizationResult;
    /**
     * Creates a copy of the target context with an overwritten area for storing local variables.
     * Note that if such a property already exists a shallow copy of that will be used in the context copy.
     * That means you can replace variables in a nested local context without changing what's assigned to that variable in the parent context.
     * In effect this provides limited support for scoped variables.
     * @function
     * @param {KeyValueMap} context - values to be copied
     * @returns {KeyValueMap} copy of the provided context with a local variables property
     */
    createLocalContext(context: KeyValueMap): KeyValueMap;
    /**
     * Tries to retrieve a value from within the local variables property of a given context object.
     * @function
     * @param {KeyValueMap} context - object the value should be inserted into
     * @param {string} key - key for the property to be retrieved
     * @returns {unknown} value found, if any
     */
    getLocalValue(context: KeyValueMap, key: string): unknown;
    /**
     * Tries to set a value within the local variables property of a given context object.
     * @function
     * @param {KeyValueMap} context - object the value should be inserted into
     * @param {string} key - key for the property to be set
     * @param {unknown} value - value to be stored
     */
    setLocalValue(context: KeyValueMap, key: string, value: unknown): void;
}
