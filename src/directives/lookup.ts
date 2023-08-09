import {
  type KeyedTemplateResolver,
  type KeyedTemplateDirective,
  type TemplateOptimizationResult
} from '../resolver/template-resolver'
import {
  type KeyValueMap,
  type AnyObject
} from '../resolver/basic-types'

/**
 * Acts as a reference to property function calls.
 * @interface
 * @property {string} name - property name of the target function
 * @property {unknown} args - arguments to be used in the call
 */
export interface PropertyCallRequest {
  name: string
  args?: unknown[]
}

export type PropertyLookupStep = string | number | PropertyCallRequest

export type ArrayAccessCallback = (source: unknown[], args: unknown[]) => unknown

export type AnyFunction = () => unknown

export type PropertyOwner = AnyObject | AnyFunction

/**
 * This defines a request to retrieve a nested value.
 * @interface
 * @property {unknown} source - object containing the target value (defaults to using context)
 * @property {unknown[]} path - steps to reach the target value
 * @property {unknown} default - value to return if value is not found or is undefined
 */
export interface GetNestedValueParams {
  source: unknown
  path: unknown[]
  default: unknown
}

/**
 * This directive tries to find a nested value within an object given the value's path.
 * @class
 * @implements {KeyedTemplateDirective<GetNestedValueParams>}
 */
export class GetNestedValueDirective implements KeyedTemplateDirective<GetNestedValueParams> {
  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): GetNestedValueParams {
    return {
      source: resolver.resolveValue(params.source, context),
      path: resolver.getArray(params.path, context),
      default: params.default
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    const value = this.resolveUntypedPath(
      spec.source,
      spec.path,
      context,
      resolver
    )
    if (value === undefined && spec.default !== undefined) {
      return resolver.resolveValue(spec.default, context)
    }
    return resolver.createDeepCopy(value)
  }

  /**
   * Steps through a provided path for a given object to try retrieving a particular value.
   * @function
   * @param {unknown} source - expected container for the target value
   * @param {unknown[]} path - steps to reach the target value
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @param {KeyedTemplateResolver} resolver - template resolver to be used
   * @returns {unknown} retrieved value, if any
   */
  resolveUntypedPath (
    source: unknown,
    path: unknown[],
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    let target: unknown = source ?? context
    for (const step of path) {
      const targetType = typeof target
      if (
        (targetType === 'object' && target != null) ||
        targetType === 'function'
      ) {
        const parent = target as PropertyOwner
        const resolvedStep = resolver.resolveValue(step, context)
        const validStep = this.getValidStepFrom(resolvedStep)
        if (validStep == null) return undefined
        target = this.resolveStep(parent, validStep)
      } else return undefined
    }
    return target
  }

  /**
   * Tries to convert an unknown value into something we can use as a path step.
   * @function
   * @param {unknown} source - value to be converted
   * @returns {unknown} converted step value if conversion is successful
   */
  getValidStepFrom (
    source: unknown
  ): PropertyLookupStep | undefined {
    switch (typeof source) {
      case 'string':
      case 'number': {
        return source
      }
      case 'object': {
        if (
          source !== null &&
          'name' in source &&
          typeof source.name === 'string'
        ) {
          return source as PropertyCallRequest
        }
        break
      }
    }
  }

  /**
   * Tries to get the specified property value from the target object or function.
   * @function
   * @param {PropertyOwner} source - ower of the target property
   * @param {PropertyLookupStep} step - defines how the value should be retrieved
   * @returns {unknown} retrieved value, if any
   */
  resolveStep (
    source: PropertyOwner,
    step: PropertyLookupStep
  ): unknown {
    if (Array.isArray(source)) {
      return this.resolveArrayLookUp(source, step)
    }
    if (typeof step === 'object') {
      return this.resolvePropertyCall(source, step)
    }
    return (source as KeyValueMap)[step]
  }

  /**
   * Tries to get the specified property value from an array.
   * @function
   * @param {PropertyOwner} source - ower of the target property
   * @param {PropertyLookupStep} step - defines how the value should be retrieved
   * @returns {unknown} retrieved value, if any
   */
  resolveArrayLookUp (
    source: unknown[],
    step: PropertyLookupStep
  ): unknown {
    switch (typeof step) {
      case 'object': {
        const callback = (source as any)[step.name]
        if (typeof callback === 'function') {
          const copy = source.slice()
          const args = (step.args != null) ? step.args : []
          return callback.apply(copy, args)
        }
        return undefined
      }
      case 'string': {
        return (source as any)[step]
      }
    }
    const index = Number(step)
    return source[index]
  }

  /**
   * Tries to execute the named function and return the results.
   * @function
   * @param {PropertyOwner} source - ower of the target function
   * @param {PropertyCallRequest} request - propery name of target function and arguments to be used
   * @returns {unknown} return value of the function if found
   */
  resolvePropertyCall (
    source: KeyValueMap | AnyFunction,
    request: PropertyCallRequest
  ): unknown {
    const callback = (source as KeyValueMap)[request.name]
    if (typeof callback === 'function' && callback != null) {
      const args = (request.args != null) ? request.args : []
      return callback.apply(null, args)
    }
  }

  optimizeTemplate (
    params: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): TemplateOptimizationResult {
    return {
      executable: false,
      value: { ...params }
    }
  }
}

/**
 * Tries to get a value from the local variables of the current context.
 * This functions much like other get nested value directives, but prepends the local variables key and returns the retrieved value directly.
 * This should make it both more compact and faster than a general lookup due to not needing a copy operation.
 * @class
 * @implements {GetNestedValueDirective}
 */
export class GetLocalVariableDirective extends GetNestedValueDirective {
  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    const fullPath = spec.path.slice()
    fullPath.unshift(resolver.localVariablesKey)
    const value = this.resolveUntypedPath(
      spec.source,
      fullPath,
      context,
      resolver
    )
    return value
  }
}
