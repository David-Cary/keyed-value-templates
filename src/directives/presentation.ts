import {
  type KeyedTemplateResolver,
  type KeyedTemplateDirective
} from '../resolver/template-resolver'
import {
  type KeyValueMap
} from '../resolver/basic-types'

/**
 * Covers request to resolve a template using the provided local variables.
 * @interface
 * @property {KeyValueMap} data - map of local variables to be used
 * @property {any} template - value to be resolved using the provided variables
 */
export interface DataViewParameters {
  data: KeyValueMap
  template: any
}

/**
 * This directive resolves the provided template using the specified local variables.
 * @class
 * @implements {KeyedTemplateDirective<DataViewParameters>}
 */
export class DataViewDirective implements KeyedTemplateDirective<DataViewParameters, any> {
  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): DataViewParameters {
    const resolvedData = resolver.resolveValue(params.data, context)
    return {
      data: (
        typeof params.data === 'object' &&
          params.data != null &&
          !Array.isArray(params.data)
      )
        ? resolvedData as KeyValueMap
        : {},
      template: resolver.resolveValue(params.template, context)
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    const localContext = resolver.createLocalContext(context)
    for (const key in spec.data) {
      resolver.setLocalValue(localContext, key, spec.data[key])
    }
    const result = resolver.resolveValue(spec.template, localContext)
    return result
  }
}
