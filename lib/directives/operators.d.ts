import { type KeyedTemplateResolver, type KeyValueMap, type KeyedTemplateDirective } from '../resolver/template-resolver';
import { type ArgumentsWrapper } from './comparisons';
import { type ValueWrapper } from './typing';
export type RepeatableOperationDirectiveCallback<T = unknown> = (a: T, b: T) => T;
/**
 * This directive performs the target operation on all provided arguments, working from the first pair to the last argument.
 * This involves applying the operation to the first two argument, then repeating for the previous results and the next available argument.
 * @class
 * @implements {KeyedTemplateDirective<ArgumentsWrapper>}
 * @property {RepeatableOperationDirectiveCallback} callback - operation to be applied to each pairing
 * @property {(value: unknown) => boolean} checkExitSignal - optional callback that should return true if we should stop iterating through the arguments when a certain value is found

 */
export declare class RepeatedOperationDirective implements KeyedTemplateDirective<ArgumentsWrapper> {
    readonly callback: RepeatableOperationDirectiveCallback;
    readonly checkExitSignal?: (value: unknown) => boolean;
    constructor(callback: RepeatableOperationDirectiveCallback, checkExitSignal?: (value: unknown) => boolean);
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): ArgumentsWrapper;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
}
/**
 * This works as a more general RepeatedOperationDirective, with the exception that it converts arguments to a particular type before performing the operation.
 * @class
 * @template T
 * @implements {KeyedTemplateDirective<ArgumentsWrapper>}
 * @property {(value: unknown) => T} convertor - callback to convert arguments to the target type
 * @property {RepeatableOperationDirectiveCallback} callback - operation to be applied to each pairing
 * @property {(value: unknown) => boolean} checkExitSignal - optional callback that should return true if we should stop iterating through the arguments when a certain value is found
 */
export declare class TypedRepeatedOperationDirective<T> implements KeyedTemplateDirective<ArgumentsWrapper> {
    readonly convertor: (value: unknown) => T;
    readonly callback: RepeatableOperationDirectiveCallback<T>;
    readonly checkExitSignal?: (value: T) => boolean;
    constructor(convertor: (value: unknown) => T, callback: RepeatableOperationDirectiveCallback<T>, checkExitSignal?: (value: T) => boolean);
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): ArgumentsWrapper;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): T | undefined;
}
export type CommonKey = string | number;
/**
 * Converts a value into either a string or number if it's not one already.
 * @function
 * @param {unknown} source - value to be converted
 * @returns {CommonKey} converted value
 */
export declare function castToCommonKey(source: unknown): CommonKey;
/**
 * Adds up all provided arguments.
 * @class
 * @implements {TypedRepeatedOperationDirective<CommonKey>}
 */
export declare class AdditionDirective extends TypedRepeatedOperationDirective<CommonKey> {
    constructor();
}
/**
 * Subtracts all following arguments from the first argument.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
export declare class SubtractionDirective extends TypedRepeatedOperationDirective<number> {
    constructor();
}
/**
 * Multiplies all provided arguments.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
export declare class MultiplicationDirective extends TypedRepeatedOperationDirective<number> {
    constructor();
}
/**
 * Raises the previous argument to the power of the next argument.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
export declare class ExponentiationDirective extends TypedRepeatedOperationDirective<number> {
    constructor();
}
/**
 * Divides the first argument by all following arguments.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
export declare class DivisionDirective extends TypedRepeatedOperationDirective<number> {
    constructor();
}
/**
 * Get the remainder of the first argument when divided by all following arguments.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
export declare class RemainderDirective extends TypedRepeatedOperationDirective<number> {
    constructor();
}
/**
 * Returns true if and only if all arguments are true.
 * @class
 * @implements {TypedRepeatedOperationDirective<boolean>}
 */
export declare class AndOperatorDirective extends TypedRepeatedOperationDirective<boolean> {
    constructor();
}
/**
 * Returns true if any of the arguments are true.
 * @class
 * @implements {TypedRepeatedOperationDirective<boolean>}
 */
export declare class OrOperatorDirective extends TypedRepeatedOperationDirective<boolean> {
    constructor();
}
/**
 * Returns the first non-null argument found.
 * @class
 * @implements {RepeatedOperationDirective}
 */
export declare class NullishCoalescingDirective extends RepeatedOperationDirective {
    constructor();
}
/**
 * Negates the boolean equivalent of a given value.
 * @class
 * @implements {KeyedTemplateDirective<ValueWrapper, boolean>}
 */
export declare class NegationOperatorDirective implements KeyedTemplateDirective<ValueWrapper, boolean> {
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): ValueWrapper;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): boolean;
}
