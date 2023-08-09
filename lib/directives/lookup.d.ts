import { type KeyedTemplateResolver, type KeyedTemplateDirective, type TemplateOptimizationResult } from '../resolver/template-resolver';
import { type KeyValueMap, type AnyObject } from '../resolver/basic-types';
/**
 * Acts as a reference to property function calls.
 * @interface
 * @property {string} name - property name of the target function
 * @property {unknown} args - arguments to be used in the call
 */
export interface PropertyCallRequest {
    name: string;
    args?: unknown[];
}
export type PropertyLookupStep = string | number | PropertyCallRequest;
export type ArrayAccessCallback = (source: unknown[], args: unknown[]) => unknown;
export type AnyFunction = () => unknown;
export type PropertyOwner = AnyObject | AnyFunction;
/**
 * This defines a request to retrieve a nested value.
 * @interface
 * @property {unknown} source - object containing the target value (defaults to using context)
 * @property {unknown[]} path - steps to reach the target value
 * @property {unknown} default - value to return if value is not found or is undefined
 */
export interface GetNestedValueParams {
    source: unknown;
    path: unknown[];
    default: unknown;
}
/**
 * This directive tries to find a nested value within an object given the value's path.
 * @class
 * @implements {KeyedTemplateDirective<GetNestedValueParams>}
 */
export declare class GetNestedValueDirective implements KeyedTemplateDirective<GetNestedValueParams> {
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): GetNestedValueParams;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
    /**
     * Steps through a provided path for a given object to try retrieving a particular value.
     * @function
     * @param {unknown} source - expected container for the target value
     * @param {unknown[]} path - steps to reach the target value
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @param {KeyedTemplateResolver} resolver - template resolver to be used
     * @returns {unknown} retrieved value, if any
     */
    resolveUntypedPath(source: unknown, path: unknown[], context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
    /**
     * Tries to convert an unknown value into something we can use as a path step.
     * @function
     * @param {unknown} source - value to be converted
     * @returns {unknown} converted step value if conversion is successful
     */
    getValidStepFrom(source: unknown): PropertyLookupStep | undefined;
    /**
     * Tries to get the specified property value from the target object or function.
     * @function
     * @param {PropertyOwner} source - ower of the target property
     * @param {PropertyLookupStep} step - defines how the value should be retrieved
     * @returns {unknown} retrieved value, if any
     */
    resolveStep(source: PropertyOwner, step: PropertyLookupStep): unknown;
    /**
     * Tries to get the specified property value from an array.
     * @function
     * @param {PropertyOwner} source - ower of the target property
     * @param {PropertyLookupStep} step - defines how the value should be retrieved
     * @returns {unknown} retrieved value, if any
     */
    resolveArrayLookUp(source: unknown[], step: PropertyLookupStep): unknown;
    /**
     * Tries to execute the named function and return the results.
     * @function
     * @param {PropertyOwner} source - ower of the target function
     * @param {PropertyCallRequest} request - propery name of target function and arguments to be used
     * @returns {unknown} return value of the function if found
     */
    resolvePropertyCall(source: KeyValueMap | AnyFunction, request: PropertyCallRequest): unknown;
    optimizeTemplate(params: KeyValueMap, resolver: KeyedTemplateResolver): TemplateOptimizationResult;
}
/**
 * Tries to get a value from the local variables of the current context.
 * This functions much like other get nested value directives, but prepends the local variables key and returns the retrieved value directly.
 * This should make it both more compact and faster than a general lookup due to not needing a copy operation.
 * @class
 * @implements {GetNestedValueDirective}
 */
export declare class GetLocalVariableDirective extends GetNestedValueDirective {
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
}
