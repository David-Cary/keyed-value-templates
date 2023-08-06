import { type KeyedTemplateResolver, type KeyValueMap, type KeyedTemplateDirective } from '../resolver/template-resolver';
/**
 * This captures the state of an "if-then" statement immediately before the target branch is resolved.
 * @interface
 * @property {boolean} if - value of the evaluated expression
 * @property {unknown} then - branch to apply if the expression is true
 * @property {unknown} else - branch to apply if the expression is false
 */
export interface IfThenFork {
    if: boolean;
    then: unknown;
    else: unknown;
}
/**
 * This directive evaluates an expression and return 1 of 2 values depending on whether the expression is true or false.
 * @class
 * @implements {KeyedTemplateDirective<IfThenFork>}
 */
export declare class IfThenDirective implements KeyedTemplateDirective<IfThenFork> {
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): IfThenFork;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
}
