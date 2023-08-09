import { type KeyedTemplateResolver, type KeyedTemplateDirective } from '../resolver/template-resolver';
import { type KeyValueMap } from '../resolver/basic-types';
import { type ArgumentsWrapper } from './comparisons';
/**
 * This describes a function call to be executes as well as the arguments to be used.
 * @interface
 * @property {unknown} target - function to be executed
 */
export interface FunctionCallParams extends ArgumentsWrapper {
    target: unknown;
}
/**
 * This directive executes the provided function with a given set of arguments and returns the results.
 * @class
 * @implements {KeyedTemplateDirective<FunctionCallParams>}
 */
export declare class FunctionCallDirective implements KeyedTemplateDirective<FunctionCallParams> {
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): FunctionCallParams;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
}
