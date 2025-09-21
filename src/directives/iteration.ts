import {
  type KeyedTemplateResolver,
  type KeyedTemplateDirective
} from '../resolver/template-resolver'
import {
  type AnyObject,
  type KeyValueMap
} from '../resolver/basic-types'

/**
 * Covers requests to convert an object with potential key and value transformations.
 * @interface
 * @property {AnyObject | undefined} source - object to be copied
 * @property {any | undefined} getKey - transform to be applied to the object's keys
 * @property {any | undefined} getValue - transform to be applied to the object's values
 */
export interface MapValuesParameters {
  source?: AnyObject
  getKey?: any
  getValue?: any
}

/**
 * This directive creates a copy of the provided source object with optional transformations applied to the keys and strings.
 * @class
 * @implements {KeyedTemplateDirective<MapValuesParameters, any>}
 */
export class MapValuesDirective implements KeyedTemplateDirective<MapValuesParameters, any> {
  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): MapValuesParameters {
    const resolvedSource = resolver.resolveValue(params.source, context)
    return {
      source: (
        typeof resolvedSource === 'object' &&
          resolvedSource != null
      )
        ? resolvedSource as AnyObject
        : undefined,
      getKey: params.getKey,
      getValue: params.getValue
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): any {
    const spec = this.processParams(params, context, resolver)
    const localContext = resolver.createLocalContext(context)
    if (spec.source != null) {
      if (Array.isArray(spec.source)) {
        const results: any[] = []
        for (let index = 0; index < spec.source.length; index++) {
          resolver.setLocalValue(localContext, '$index', index)
          resolver.setLocalValue(localContext, '$value', spec.source[index])
          let position = index
          if (spec.getKey != null) {
            position = Number(resolver.resolveValue(spec.getKey, localContext))
            if (isNaN(position)) continue
          }
          results[position] = spec.getValue != null
            ? resolver.resolveValue(spec.getValue, localContext)
            : spec.source[index]
        }
        return results
      }
      const results: Record<string, any> = {}
      for (const key in spec.source) {
        resolver.setLocalValue(localContext, '$key', key)
        resolver.setLocalValue(localContext, '$value', spec.source[key])
        let validKey = key
        if (spec.getKey != null) {
          const resolvedKey = resolver.resolveValue(spec.getKey, localContext)
          if (resolvedKey == null || resolvedKey === '') continue
          validKey = String(resolvedKey)
        }
        results[validKey] = spec.getValue != null
          ? resolver.resolveValue(spec.getValue, localContext)
          : spec.source[key]
      }
      return results
    }
    return spec.source
  }
}
