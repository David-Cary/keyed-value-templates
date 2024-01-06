import { type KeyedTemplateResolver, type KeyedTemplateDirective } from '../resolver/template-resolver';
import { type KeyValueMap } from '../resolver/basic-types';
/**
 * Covers request to resolve a template using the provided local variables.
 * @interface
 * @property {KeyValueMap} data - map of local variables to be used
 * @property {any} template - value to be resolved using the provided variables
 */
export interface DataViewParameters {
    data: KeyValueMap;
    template: any;
}
/**
 * This directive resolves the provided template using the specified local variables.
 * @class
 * @implements {KeyedTemplateDirective<DataViewParameters>}
 */
export declare class DataViewDirective implements KeyedTemplateDirective<DataViewParameters, any> {
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): DataViewParameters;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
}
