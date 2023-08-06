import { type KeyedTemplateResolver, type KeyValueMap, type KeyedTemplateDirective, type TemplateOptimizationCallback } from '../resolver/template-resolver';
export type ParseStringCallback = (source: string, context: KeyValueMap) => unknown;
export type ContextResolverCallback = (context: KeyValueMap) => unknown;
export type ParseStringResolverCallback = (source: string) => ContextResolverCallback;
/**
 * Simple wrapper for string values.
 * @interface
 * @property {string} text - target argument list
 */
export interface TextWrapper {
    text: string;
}
/**
 * This directive processes string values, potentially converting them to another type of value.
 * @class
 * @implements {KeyedTemplateDirective<TextWrapper>}
 * @property {ParseStringCallback} parseString - callback for converting strings
 */
export declare class ParseStringDirective implements KeyedTemplateDirective<TextWrapper> {
    readonly parseString: ParseStringCallback;
    readonly optimizeTemplate?: TemplateOptimizationCallback;
    constructor(parseString: ParseStringCallback, optimizeTemplate?: TemplateOptimizationCallback);
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): TextWrapper;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
}
