import { type KeyedTemplateResolver, type KeyValueMap, type KeyedTemplateDirective } from '../resolver/template-resolver';
/**
 * This simply wraps an argument list in an object.
 * @interface
 * @property {unknown[]} args - target argument list
 */
export interface ArgumentsWrapper {
    args: unknown[];
}
export type ComparisonCallback<T = any> = (a: T, b: T) => boolean;
/**
 * This directive iterates through an argument list, performing a given comparison on each adjacent pair of values until the comparison is false.
 * This makes it roughly equivalent to "compare(a, b) && compare(b, c)..".
 * In most cases you'll probably only use this with 2 arguments, but should you need it support for more is there.
 * @class
 * @implements {KeyedTemplateDirective<ArgumentsWrapper, boolean>}
 * @property {ComparisonCallback} callback - comparison to be performed on each pair
 */
export declare class SerialComparisonDirective implements KeyedTemplateDirective<ArgumentsWrapper, boolean> {
    readonly callback: ComparisonCallback;
    constructor(callback: ComparisonCallback);
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): ArgumentsWrapper;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): boolean;
}
/**
 * Performs an equality comparison ("==") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export declare class EqualityDirective extends SerialComparisonDirective {
    constructor();
}
/**
 * Performs a strict equality comparison ("===") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export declare class StrictEqualityDirective extends SerialComparisonDirective {
    constructor();
}
/**
 * Performs an inequality comparison ("!=") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export declare class InequalityDirective extends SerialComparisonDirective {
    constructor();
}
/**
 * Performs a strict inequality comparison ("!==") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export declare class StrictInequalityDirective extends SerialComparisonDirective {
    constructor();
}
/**
 * Performs a "less than" comparison ("<") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export declare class LessThanDirective extends SerialComparisonDirective {
    constructor();
}
/**
 * Performs a "less than or equal to" comparison ("<=") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export declare class LessThanOrEqualToDirective extends SerialComparisonDirective {
    constructor();
}
/**
 * Performs a "greater than" comparison (">") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export declare class GreaterThanDirective extends SerialComparisonDirective {
    constructor();
}
/**
 * Performs a "greater than or equal to" comparison (">=") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export declare class GreaterThanOrEqualToDirective extends SerialComparisonDirective {
    constructor();
}
/**
 * This covers a the endpoint of a value range and a positon to compare to that range.
 * @template T
 * @interface
 * @property {T} min - minimum value of range
 * @property {T} max - maximum value of range
 * @property {T} value - target value to be evaluated
 */
export interface ValueInRangeParams<T = any> {
    min: T;
    max: T;
    value: T;
}
/**
 * This directive checks if a value falls between a given minimum and maximum.
 * This makes it functionality equivalent to "min <= value && value <= max".
 * @class
 * @implements {KeyedTemplateDirective<ValueInRangeParams, boolean>}
 */
export declare class ValueInRangeDirective implements KeyedTemplateDirective<ValueInRangeParams, boolean> {
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): ValueInRangeParams;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): boolean;
}
