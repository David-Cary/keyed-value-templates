import {
  type KeyedTemplateResolver,
  type KeyedTemplateDirective,
  type ObjectResolutionState
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
    const state = resolver.getResolutionState(context)
    const resolvedSource = resolver.processParameter(
      params,
      'source',
      (value) => resolver.resolveValue(value, context),
      state
    )
    return {
      source: (
        typeof resolvedSource === 'object' && resolvedSource != null
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
      const state: ObjectResolutionState = {
        parent: resolver.getResolutionState(context),
        source: spec.source
      }
      localContext[resolver.resolutionStateKey] = state
      if (Array.isArray(spec.source)) {
        const results: any[] = []
        for (state.index = 0; state.index < spec.source.length; state.index++) {
          resolver.setLocalValue(localContext, '$index', state.index)
          resolver.setLocalValue(localContext, '$value', spec.source[state.index])
          let position = state.index
          if (spec.getKey != null) {
            position = Number(resolver.resolveValue(spec.getKey, localContext))
            if (isNaN(position)) continue
          }
          results[position] = spec.getValue != null
            ? resolver.resolveValue(spec.getValue, localContext)
            : spec.source[state.index]
        }
        return results
      }
      const results: Record<string, any> = {}
      for (const key in spec.source) {
        state.property = key
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
