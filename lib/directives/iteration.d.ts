import { type KeyedTemplateResolver, type KeyedTemplateDirective } from '../resolver/template-resolver';
import { type AnyObject, type KeyValueMap } from '../resolver/basic-types';
/**
 * Covers requests to convert an object with potential key and value transformations.
 * @interface
 * @property {AnyObject | undefined} source - object to be copied
 * @property {any | undefined} getKey - transform to be applied to the object's keys
 * @property {any | undefined} getValue - transform to be applied to the object's values
 */
export interface MapValuesParameters {
    source?: AnyObject;
    getKey?: any;
    getValue?: any;
}
/**
 * This directive creates a copy of the provided source object with optional transformations applied to the keys and strings.
 * @class
 * @implements {KeyedTemplateDirective<MapValuesParameters, any>}
 */
export declare class MapValuesDirective implements KeyedTemplateDirective<MapValuesParameters, any> {
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): MapValuesParameters;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): any;
}
