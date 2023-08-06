import { type KeyedTemplateResolver, type KeyValueMap, type KeyedTemplateDirective } from '../resolver/template-resolver';
import { type MultiStepParams, MultiStepDirective } from './scripting';
/**
 * This describes the potential contents of a case block within a switch statement.
 * @interface
 * @property {any} case - value to be matched against when evaluating this block
 */
export interface SwitchDirectiveBlock extends MultiStepParams {
    case?: any;
}
/**
 * Cover the state of switch resolution just before case blocks are processed.
 * @interface
 * @property {any} value - value to be compared to each case
 * @property {unknown[]} cases - case blocks to be compared to the target value
 */
export interface SwitchDirectiveFork {
    value: any;
    cases: unknown[];
}
/**
 * This directive mimics the behavior of a javascript switch statement.
 * @class
 * @implements {KeyedTemplateDirective<SwitchDirectiveFork>}
 */
export declare class SwitchDirective implements KeyedTemplateDirective<SwitchDirectiveFork> {
    protected _stepHandler: MultiStepDirective;
    constructor(exitIds?: string[]);
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): SwitchDirectiveFork;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
    /**
     * Converts a value to a case block.
     * @function
     * @param {unknown} source - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @param {KeyedTemplateResolver} resolver - template resolver to be used
     * @returns {SwitchDirectiveBlock} converted value as a case block
     */
    getCaseBlock(source: unknown, context: KeyValueMap, resolver: KeyedTemplateResolver): SwitchDirectiveBlock;
}
