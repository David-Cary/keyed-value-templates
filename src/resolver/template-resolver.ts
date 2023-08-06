export type KeyValueMap = Record<string, unknown>
export type AnyObject = KeyValueMap | unknown[]

/**
 * These are used to attach additional data to the results of trying to optimize a template item.
 * @interface
 * @property {value} unknown - optimized version of the target item
 * @property {boolean} executable - signals whether the returned value should be used by another directive
 */
export interface TemplateOptimizationResult {
  value: unknown
  executable: boolean
}

export type TemplateOptimizationCallback = (
  params: KeyValueMap,
  resolver: KeyedTemplateResolver
) => TemplateOptimizationResult

/**
 * Directives provide special processing and conversion to target objects based on the type of directive.
 * @interface
 * @template P, R
 */
export interface KeyedTemplateDirective<P = unknown, R = unknown> {
  /**
   * Performs typecasting and a first pass of initialization on a provided key value map.
   * @function
   * @param {KeyValueMap} params - key value map to be converted
   * @param {KeyValueMap} context - map of values to be used in initialization
   * @param {KeyedTemplateResolver} resolver - template resolver to be used in initialization
   * @returns {P} Converted and initialized version of the provided parameters
   */
  processParams?: (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ) => P

  /**
   * Tries to extract a particular value based on the provided parameters and context.
   * @function
   * @param {KeyValueMap} params - parameters for the extraction process
   * @param {KeyValueMap} context - additional data and functionality made available to the process
   * @param {KeyedTemplateResolver} resolver - template resolver to be used by the process
   * @returns {R} results of performing the process on the provided data
   */
  execute: (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ) => R

  /**
   * Optional function that signals this directive should receive special handling during optimization.
   * @function
   * @param {KeyValueMap} params - values to be optimized
   * @param {KeyedTemplateResolver} resolver - template resolver requesting the optimization
   * @returns {TemplateOptimizationResult} optimized value and whether or not it should be used in further optimization
   */
  optimizeTemplate?: TemplateOptimizationCallback
}

export type TypeConversionCallback<F = unknown, T = unknown> = (value: F) => T

/**
 * These resolvers provide a suite of utility functions for converting keyed template objects to their intended values for a particular context.
 * In this case, a keyed template is an object with a specified property that not only indicates the object should be processes, but also what process should be used to convert it.
 * @class
 * @property {Record<string, KeyedTemplateDirective>} directives - map of directives to use for a particular key.
 * @property {string} directivesKey - property to be treated as an object template marker (defaults to '$use')
 * @property {string} localVariablesKey - property to be attach to a local context for storing local variables (defaults to '$vars')
 */
export class KeyedTemplateResolver {
  readonly directives: Record<string, KeyedTemplateDirective>
  readonly directivesKey: string
  readonly localVariablesKey: string

  constructor (
    directives: Record<string, KeyedTemplateDirective> = {},
    directivesKey = '$use',
    localVariablesKey = '$vars'
  ) {
    this.directives = directives
    this.directivesKey = directivesKey
    this.localVariablesKey = localVariablesKey
  }

  /**
   * Resolves all template objects in the provided value.
   * @function
   * @param {unknown} value - value to be converted
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @returns {unknown} version of the value with templates resolved
   */
  resolveValue (
    value: unknown,
    context: KeyValueMap = {}
  ): unknown {
    if (typeof value === 'object' && value != null) {
      if (Array.isArray(value)) {
        return this.resolveValues(value, context)
      }
      return this.resolveObject(value as KeyValueMap, context)
    }
    return value
  }

  /**
   * Resolves the target as a template and converts the results to a particular type.
   * @template T
   * @function
   * @param {unknown} value - value to be converted
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @param {TypeConversionCallback<unknown, T>} convertor - callback used to convert the results
   * @returns {T} converted and resolved version of the provided value
   */
  resolveTypedValue<T>(
    value: unknown,
    context: KeyValueMap,
    convertor: TypeConversionCallback<unknown, T>
  ): T {
    const rawValue = this.resolveValue(value, context)
    return convertor(rawValue)
  }

  /**
   * Resolves all template objects in a given array.
   * @function
   * @param {unknown} value - array to be processed
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @returns {unknown[]} array of converted objects
   */
  resolveValues (
    value: unknown[],
    context: KeyValueMap = {}
  ): unknown[] {
    return value.map(item => this.resolveValue(item, context))
  }

  /**
   * Resolves the items in an array and converts them to a particular type.
   * @template T
   * @function
   * @param {unknown} value - array to be processed
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @param {TypeConversionCallback<unknown, T>} convertor - callback used to convert the results
   * @returns {T[]} converted and resolved version of the provided array's contents
   */
  resolveTypedValues<T>(
    value: unknown[],
    context: KeyValueMap,
    convertor: TypeConversionCallback<unknown, T>
  ): T[] {
    return value.map(item => this.resolveTypedValue(item, context, convertor))
  }

  /**
   * Tries to resolve an object as a possible template, then tries to resolve the object's property values.
   * @function
   * @param {unknown} value - object to be converted
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @returns {unknown} version of the object with templates resolved
   */
  resolveObject (
    value: KeyValueMap,
    context: KeyValueMap = {}
  ): unknown {
    const directive = this.getObjectDirective(value)
    if (directive != null) {
      const resolvedValue = directive.execute(value, context, this)
      return resolvedValue
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return this.resolveValues(value, context)
      }
      if (value != null) {
        const valueMap = value
        const copy: KeyValueMap = {}
        for (const key in valueMap) {
          copy[key] = this.resolveValue(valueMap[key], context)
        }
        return copy
      }
    }
    return value
  }

  /**
   * Tries to resolve an object as a possible template, but leaves any resulting property values alone.
   * @function
   * @param {unknown} value - object to be converted
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @returns {unknown} results of processing the object as a template
   */
  executeObjectDirective (
    value: KeyValueMap,
    context: KeyValueMap = {}
  ): unknown {
    const directive = this.getObjectDirective(value)
    if (directive != null) {
      const resolvedValue = directive.execute(value, context, this)
      return resolvedValue
    }
    return value
  }

  /**
   * Retrieves the directive that would be used if the target object were treated as a template.
   * @function
   * @param {unknown} value - object to be evaluated
   * @returns {KeyedTemplateDirective | undefined} directive to be used, if any
   */
  getObjectDirective (value: KeyValueMap): KeyedTemplateDirective | undefined {
    if (this.directivesKey in value) {
      const directiveId = value[this.directivesKey]
      if (typeof directiveId === 'string') {
        return this.directives[directiveId]
      }
    }
  }

  /**
   * Retrieves the key for the directive that would be used if the target value were treated as a template.
   * @function
   * @param {unknown} value - value to be evaluated
   * @returns {string | undefined} key for the appropriate directive, if any
   */
  getDirectiveIdFor (value: unknown): string | undefined {
    if (typeof value === 'object' &&
      value != null &&
      this.directivesKey in value
    ) {
      const valueMap = value as KeyValueMap
      const directiveId = valueMap[this.directivesKey]
      if (typeof directiveId === 'string') {
        return directiveId
      }
    }
  }

  /**
   * Tries to resolve a value as a possible template.  If the result is an object, the properties do not in turn get resolved.
   * @function
   * @param {unknown} value - value to be converted
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @returns {unknown} results of processing the value as a template
   */
  executeDirectiveFor (
    value: unknown,
    context: KeyValueMap = {}
  ): unknown {
    if (typeof value === 'object' && value != null && !Array.isArray(value)) {
      return this.executeObjectDirective(value as KeyValueMap, context)
    }
    return value
  }

  /**
   * Casts the results of template resolution to an array.
   * @function
   * @param {unknown} value - value to be converted
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @returns {unknown[]} the resolved value either as an array or wrapped in an array
   */
  getArray (
    value: unknown,
    context: KeyValueMap = {}
  ): unknown [] {
    const resolved = this.executeDirectiveFor(value, context)
    if (Array.isArray(resolved)) return resolved
    return resolved === undefined ? [] : [resolved]
  }

  /**
   * Casts the results of template resolution to a typed array.
   * @template T
   * @function
   * @param {unknown} value - value to be converted
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @param {TypeConversionCallback<unknown, T>} convertor - callback used to convert each item
   * @returns {T[]} the resolved value either as a typed array or wrapped in such an array
   */
  getTypedArray<T>(
    value: unknown,
    context: KeyValueMap,
    convertor: TypeConversionCallback<unknown, T>
  ): T[] {
    const items = this.getArray(value, context)
    return this.resolveTypedValues(items, context, convertor)
  }

  /**
   * Resolved all contents of the target as templates and packages the results in an array.
   * @function
   * @param {unknown} value - value to be converted
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @returns {unknown[]} array of all resolved values
   */
  resolveAsArray (
    value: unknown,
    context: KeyValueMap = {}
  ): unknown[] {
    const items = this.getArray(value, context)
    return this.resolveValues(items, context)
  }

  /**
   * Resolves the target as a template and converts the results to a key value map.
   * For strings, this wraps them in an object where the key and value are the same.
   * Any results that can't be treated that way wrap the results as the object's 'value' property.
   * @function
   * @param {unknown} value - value to be converted
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @returns {KeyValueMap} resolved value as a key value map
   */
  getValueMap (
    value: unknown,
    context: KeyValueMap = {}
  ): KeyValueMap {
    const resolved = this.executeDirectiveFor(value, context)
    if (typeof resolved === 'object' && resolved != null) {
      return resolved as KeyValueMap
    }
    if (typeof resolved === 'string') {
      return {
        [resolved]: resolved
      }
    }
    return {
      value: resolved
    }
  }

  /**
   * Produces a deep copy of the target value, ignoring all directive markers.
   * This means all objects in the copy are themselves copies, meaning they can altered without affecting the original.
   * Note that this does not currently apply to functions.  For those only the referennce is copied, so copy will continue to use functions of the original.
   * @function
   * @param {unknown} source - value to be copied
   * @returns {unknown} deep copy of the source
   */
  createDeepCopy (source: unknown): unknown {
    if (typeof source === 'object' && source != null) {
      if (Array.isArray(source)) {
        return source.map(item => this.createDeepCopy(item))
      }
      const valueMap = source as KeyValueMap
      const result: KeyValueMap = {}
      for (const key in valueMap) {
        result[key] = this.createDeepCopy(valueMap[key])
      }
      return result
    }
    return source
  }

  /**
   * Retrieves a version of the template with context independent members already processed.
   * This should result in faster processing when the context is applied as some values are precalculated.
   * @function
   * @param {unknown} template - value to preprocessed
   * @returns {TemplateOptimizationResult} optimized version of the provided template and whether the results can themselves be used in further optimization
   */
  optimizeTemplate (template: unknown): TemplateOptimizationResult {
    const result: TemplateOptimizationResult = {
      executable: true,
      value: template
    }
    if (typeof template === 'object' && template != null) {
      if (Array.isArray(template)) {
        result.value = template.map(item => {
          const subresult = this.optimizeTemplate(item)
          if (!subresult.executable) {
            result.executable = false
          }
          return subresult.value
        })
      } else {
        const valueMap = template as KeyValueMap
        const directive = this.getObjectDirective(valueMap)
        if (directive?.optimizeTemplate != null) {
          return directive.optimizeTemplate(valueMap, this)
        }
        const optimizedParams: KeyValueMap = {}
        for (const key in valueMap) {
          const subresult = this.optimizeTemplate(valueMap[key])
          optimizedParams[key] = subresult.value
          if (!subresult.executable) {
            result.executable = false
          }
        }
        result.value = (directive != null && result.executable)
          ? directive.execute(optimizedParams, {}, this)
          : optimizedParams
      }
    }
    return result
  }

  /**
   * Creates a copy of the target context with an overwritten area for storing local variables.
   * Note that if such a property already exists a shallow copy of that will be used in the context copy.
   * That means you can replace variables in a nested local context without changing what's assigned to that variable in the parent context.
   * In effect this provides limited support for scoped variables.
   * @function
   * @param {KeyValueMap} context - values to be copied
   * @returns {KeyValueMap} copy of the provided context with a local variables property
   */
  createLocalContext (context: KeyValueMap): KeyValueMap {
    const localContext = { ...context }
    if (this.localVariablesKey != null) {
      const previousVars = context[this.localVariablesKey]
      localContext[this.localVariablesKey] = (previousVars != null)
        ? { ...previousVars }
        : {}
    }
    return localContext
  }

  /**
   * Tries to retrieve a value from within the local variables property of a given context object.
   * @function
   * @param {KeyValueMap} context - object the value should be inserted into
   * @param {string} key - key for the property to be retrieved
   * @returns {unknown} value found, if any
   */
  getLocalValue (
    context: KeyValueMap,
    key: string
  ): unknown {
    if (this.localVariablesKey in context) {
      const variables = context[this.localVariablesKey]
      if (typeof variables === 'object' && variables != null) {
        return (variables as KeyValueMap)[key]
      }
    }
  }

  /**
   * Tries to set a value within the local variables property of a given context object.
   * @function
   * @param {KeyValueMap} context - object the value should be inserted into
   * @param {string} key - key for the property to be set
   * @param {unknown} value - value to be stored
   */
  setLocalValue (
    context: KeyValueMap,
    key: string,
    value: unknown
  ): void {
    if (this.localVariablesKey in context) {
      const destination = context[this.localVariablesKey]
      if (typeof destination === 'object' && destination != null) {
        (destination as KeyValueMap)[key] = value
      }
    }
  }
}
