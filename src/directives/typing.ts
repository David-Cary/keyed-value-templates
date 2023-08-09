import {
  type KeyedTemplateResolver,
  type KeyedTemplateDirective,
  type TemplateOptimizationResult
} from '../resolver/template-resolver'
import {
  type KeyValueMap,
  type TypeConversionCallback
} from '../resolver/basic-types'

/**
 * This simply wraps a value in an object.
 * @template T
 * @interface
 * @property {T} value - value to be wrapped
 */
export interface ValueWrapper<T = unknown> {
  value: T
}

/**
 * This directive tries to convert the provided value to a function.
 * This is especially useful if triggering an object function that uses a callback.
 * @class
 * @implements {KeyedTemplateDirective<ValueWrapper>}
 */
export class CallbackDirective implements KeyedTemplateDirective<ValueWrapper> {
  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): ValueWrapper {
    return {
      value: params.value
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    return this.castToFunction(params.value, context, resolver)
  }

  /**
   * Converts the provided value to a function.
   * If a context and resolver are provided, this resolves the value as a template.
   * This resolution uses a local context with '$args' as a local variable, allowing access to the invoked arguments.
   * @function
   * @param {unknown} value - value to be converted
   * @param {KeyValueMap | undefined} context - extra data to be made available for resolution
   * @param {KeyedTemplateResolver | undefined} resolver - template resolver to be used
   * @returns {() => unknown} provided value as a function
   */
  castToFunction (
    value: unknown,
    context?: KeyValueMap,
    resolver?: KeyedTemplateResolver
  ): () => unknown {
    if (context != null && resolver != null) {
      return (...args) => {
        const localContext = resolver.createLocalContext(context)
        localContext.$args = args
        return resolver.resolveValue(value, localContext)
      }
    }
    return () => value
  }
}

/**
 * Includes both a value and possible types it can be converted to.
 * @interface
 * @property {unknown} value - value to be converted
 * @property {string[]} as - list of acceptable type strings
 */
export interface TypeConversionParams extends ValueWrapper {
  as: string[]
}

/**
 * Provides a collection of conversion callbacks from an unknown value to particular types, keyed by the name of each of those types.
 * @constant {Record<string, TypeConversionCallback>}
 */
export const DEFAULT_UNKNOWN_TO_TYPE_CONVERSIONS: Record<string, TypeConversionCallback> = {
  string: (value: unknown): string => String(value),
  number: (value: unknown): number => Number(value),
  boolean: (value: unknown): boolean => Boolean(value),
  bigint: (value: unknown): bigint => {
    if (typeof value === 'number') {
      return BigInt(value)
    }
    return BigInt(Number(value))
  },
  symbol: (value: unknown): symbol => {
    switch (typeof value) {
      case 'string': {
        return Symbol(value)
      }
      case 'number': {
        return Symbol(value)
      }
      case 'undefined': {
        return Symbol(undefined)
      }
    }
    return Symbol(String(value))
  },
  object: (value: unknown): Record<string, unknown> => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        if (typeof parsed === 'object' && parsed != null) {
          return parsed
        }
      } catch (error) {}
    }
    return {
      value
    }
  },
  array: (value: unknown): unknown[] => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          return parsed
        }
      } catch (error) {
        return [value]
      }
    }
    return Array.isArray(value) ? value : [value]
  },
  null: (value: unknown) => null,
  undefined: (value: unknown) => undefined
}

/**
 * This directive tries converting the provided value to the specified type.
 * @class
 * @implements {KeyedTemplateDirective<TypeConversionParams>}
 * @property {Record<string, TypeConversionCallback>} callbacks - map of conversion functions to use, keyed by type name
 */
export class TypeConversionDirective implements KeyedTemplateDirective<TypeConversionParams> {
  readonly callbacks: Record<string, TypeConversionCallback>

  protected _functionCaster = new CallbackDirective()

  constructor (callbacks?: Record<string, TypeConversionCallback>) {
    this.callbacks = Object.assign(
      {},
      DEFAULT_UNKNOWN_TO_TYPE_CONVERSIONS,
      callbacks
    )
  }

  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): TypeConversionParams {
    return {
      value: resolver.resolveValue(params.value, context),
      as: resolver.getTypedArray(params.as, context, String)
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    return this.castValueAs(spec.value, spec.as, context, resolver)
  }

  /**
   * Converts the target value to one of the provided types.
   * If the value is one of the provided types, no conversion takes place.  Otherwise, the first type listed is used.
   * Note that this falls back on using a CallbackDirective for functions if no specific handler for that type is provided.
   * Said CallbackDirective will use the provided context and resolver to generate the resulting function.
   * @function
   * @param {unknown} value - value to be converted
   * @param {string[]} types - names of acceptable types
   * @param {KeyValueMap | undefined} context - extra data to be made available for resolution
   * @param {KeyedTemplateResolver | undefined} resolver - template resolver to be used
   * @returns {unknown} converted value
   */
  castValueAs (
    value: unknown,
    types: string[],
    context?: KeyValueMap,
    resolver?: KeyedTemplateResolver
  ): unknown {
    if (types.length > 0) {
      const valueType = this.getExpandedTypeOf(value)
      if (!types.includes(valueType)) {
        const targetType = types[0]
        const convertor = this.callbacks[targetType]
        if (typeof convertor === 'function') {
          return convertor(value)
        }
        if (targetType === 'function') {
          return this._functionCaster.castToFunction(value, context, resolver)
        }
      }
    }
    return value
  }

  /**
   * Adds 'array' and 'null' to 'typeof' resolution.
   * @function
   * @param {unknown} value - value to be evaluated
   * @returns {string} name of the resolved type
   */
  getExpandedTypeOf (value: unknown): string {
    if (Array.isArray(value)) return 'array'
    if (value === null) return 'null'
    return typeof value
  }
}

/**
 * This directive wraps the provided value, returning an exact copy of the target value without resolving it.
 * This lets you use this to wrap other directive and protect them from execution.
 * @class
 * @implements {KeyedTemplateDirective<ValueWrapper>}
 */
export class LiteralValueDirective implements KeyedTemplateDirective<ValueWrapper> {
  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): ValueWrapper {
    return {
      value: params.value
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    return resolver.createDeepCopy(params.value)
  }

  optimizeTemplate (
    params: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): TemplateOptimizationResult {
    if (typeof params.value === 'object' && params.value != null) {
      return {
        executable: false,
        value: resolver.createDeepCopy(params)
      }
    }
    return {
      executable: true,
      value: params.value
    }
  }
}

/**
 * This directive performs 2 passes of resolution on the target value.
 * This lets it execute the value of a literal directive, circumventing their usual protection.
 * @class
 * @implements {KeyedTemplateDirective<ValueWrapper>}
 */
export class ResolveValueDirective implements KeyedTemplateDirective<ValueWrapper> {
  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): ValueWrapper {
    return {
      value: resolver.resolveValue(params.value, context)
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    return resolver.resolveValue(spec.value, context)
  }
}
