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
    const state = resolver.getResolutionState(context)
    const resolvedData = resolver.processParameter(
      params,
      'data',
      (value) => resolver.resolveValue(value, context),
      state
    )
    const preprocess = params.preprocess != null
      ? resolver.processParameter(
        params,
        'preprocess',
        (value) => resolver.resolveTypedValue(value, context, Boolean),
        state
      )
      : true
    const templateProperty = 'template' in params ? 'template' : 'via'
    return {
      data: (
        typeof resolvedData === 'object' &&
          resolvedData != null &&
          !Array.isArray(resolvedData)
      )
        ? resolvedData as KeyValueMap
        : {},
      template: preprocess
        ? resolver.processParameter(
          params,
          templateProperty,
          (value) => resolver.resolveValue(value, context),
          state
        )
        : params[templateProperty],
      templateKey: resolver.processParameter(
        params,
        'templateKey',
        (value) => resolver.resolveTypedValue(
          value,
          context,
          (value) => value != null ? String(value) : undefined
        ),
        state
      )
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    if (!this.validateTemplate(spec.template, context, resolver)) return null
    const localContext = resolver.createLocalContext(context)
    for (const key in spec.data) {
      resolver.setLocalValue(localContext, key, spec.data[key])
    }
    if (spec.templateKey != null) {
      resolver.setLocalValue(localContext, spec.templateKey, spec.template)
    }
    const state = resolver.getResolutionState(context)
    if (state != null) state.property = undefined
    const result = resolver.resolveValue(spec.template, localContext)
    return result
  }

  validateTemplate (
    template: any,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): boolean {
    // Safeguard against a context being set to the template as that can cause infinite looping.
    if (
      typeof template === 'object' &&
      template != null &&
      resolver.resolutionStateKey in template
    ) return false
    return true
  }
}
