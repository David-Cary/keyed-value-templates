import {
  type KeyedTemplateResolver,
  type KeyedTemplateDirective
} from '../resolver/template-resolver'
import {
  type KeyValueMap
} from '../resolver/basic-types'

/**
 * This captures the state of an "if-then" statement immediately before the target branch is resolved.
 * @interface
 * @property {boolean} if - value of the evaluated expression
 * @property {unknown} then - branch to apply if the expression is true
 * @property {unknown} else - branch to apply if the expression is false
 */
export interface IfThenFork {
  if: boolean
  then: unknown
  else: unknown
}

/**
 * This directive evaluates an expression and return 1 of 2 values depending on whether the expression is true or false.
 * @class
 * @implements {KeyedTemplateDirective<IfThenFork>}
 */
export class IfThenDirective implements KeyedTemplateDirective<IfThenFork> {
  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): IfThenFork {
    const state = resolver.getResolutionState(context)
    return {
      if: resolver.processParameter(
        params,
        'if',
        (value) => resolver.resolveTypedValue(value, context, Boolean),
        state
      ),
      then: params.then,
      else: params.else
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    const state = resolver.getResolutionState(context)
    if (state != null) {
      state.property = spec.if ? 'then' : 'else'
    }
    return spec.if
      ? resolver.resolveValue(spec.then, context)
      : resolver.resolveValue(spec.else, context)
  }
}
