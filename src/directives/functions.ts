import {
  type KeyedTemplateResolver,
  type KeyedTemplateDirective
} from '../resolver/template-resolver'
import {
  type KeyValueMap
} from '../resolver/basic-types'
import { type ArgumentsWrapper } from './comparisons'

/**
 * This describes a function call to be executes as well as the arguments to be used.
 * @interface
 * @property {unknown} target - function to be executed
 */
export interface FunctionCallParams extends ArgumentsWrapper {
  target: unknown
}

/**
 * This directive executes the provided function with a given set of arguments and returns the results.
 * @class
 * @implements {KeyedTemplateDirective<FunctionCallParams>}
 */
export class FunctionCallDirective implements KeyedTemplateDirective<FunctionCallParams> {
  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): FunctionCallParams {
    return {
      target: resolver.resolveValue(params.target, context),
      args: resolver.resolveAsArray(params.args, context)
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    if (typeof spec.target === 'function') {
      return spec.target.apply(null, spec.args)
    }
  }
}
