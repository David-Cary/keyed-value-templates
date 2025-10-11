import {
  type KeyedTemplateResolver,
  type KeyedTemplateDirective
} from '../resolver/template-resolver'
import {
  type KeyValueMap
} from '../resolver/basic-types'

/**
 * Covers requests to resolve a template using the provided local variables.
 * @interface
 * @property {KeyValueMap} data - map of local variables to be used
 * @property {any} template - value to be resolved using the provided variables
 */
export interface DataViewParameters {
  data: KeyValueMap
  template: any
  templateKey?: string
  preprocess?: boolean
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
    const preprocess = params.preprocess != null
      ? resolver.resolveTypedValue(params.preprocess, context, Boolean)
      : true
    return {
      data: (
        typeof resolvedData === 'object' &&
          resolvedData != null &&
          !Array.isArray(resolvedData)
      )
        ? resolvedData as KeyValueMap
        : {},
      template: preprocess
        ? resolver.resolveValue(params.template ?? params.via, context)
        : params.template,
      templateKey: resolver.resolveTypedValue(
        params.templateKey,
        context,
        (value) => value != null ? String(value) : undefined
      )
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
    if (spec.templateKey != null) {
      resolver.setLocalValue(localContext, spec.templateKey, spec.template)
    }
    const result = resolver.resolveValue(spec.template, localContext)
    return result
  }
}
