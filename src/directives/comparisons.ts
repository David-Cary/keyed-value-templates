import {
  type KeyedTemplateResolver,
  type KeyedTemplateDirective
} from '../resolver/template-resolver'
import {
  type KeyValueMap
} from '../resolver/basic-types'

/**
 * This simply wraps an argument list in an object.
 * @interface
 * @property {unknown[]} args - target argument list
 */
export interface ArgumentsWrapper {
  args: unknown[]
}

export type ComparisonCallback<T = any> = (a: T, b: T) => boolean

/**
 * This directive iterates through an argument list, performing a given comparison on each adjacent pair of values until the comparison is false.
 * This makes it roughly equivalent to "compare(a, b) && compare(b, c)..".
 * In most cases you'll probably only use this with 2 arguments, but should you need it support for more is there.
 * @class
 * @implements {KeyedTemplateDirective<ArgumentsWrapper, boolean>}
 * @property {ComparisonCallback} callback - comparison to be performed on each pair
 */
export class SerialComparisonDirective implements KeyedTemplateDirective<ArgumentsWrapper, boolean> {
  readonly callback: ComparisonCallback

  constructor (callback: ComparisonCallback) {
    this.callback = callback
  }

  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): ArgumentsWrapper {
    return {
      args: resolver.getArray(params.args, context)
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): boolean {
    const spec = this.processParams(params, context, resolver)
    if (spec.args.length > 1) {
      let left = resolver.resolveValue(spec.args[0], context)
      for (let i = 1; i < spec.args.length; i++) {
        const right = resolver.resolveValue(spec.args[i], context)
        const result = this.callback(left, right)
        if (!result) {
          return false
        }
        left = right
      }
      return true
    }
    return false
  }
}

/**
 * Performs an equality comparison ("==") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export class EqualityDirective extends SerialComparisonDirective {
  constructor () {
    /* eslint eqeqeq: 0 */
    const callback = (a: any, b: any): boolean => a == b
    super(callback)
  }
}

/**
 * Performs a strict equality comparison ("===") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export class StrictEqualityDirective extends SerialComparisonDirective {
  constructor () {
    const callback = (a: any, b: any): boolean => a === b
    super(callback)
  }
}

/**
 * Performs an inequality comparison ("!=") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export class InequalityDirective extends SerialComparisonDirective {
  constructor () {
    const callback = (a: any, b: any): boolean => a != b
    super(callback)
  }
}

/**
 * Performs a strict inequality comparison ("!==") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export class StrictInequalityDirective extends SerialComparisonDirective {
  constructor () {
    const callback = (a: any, b: any): boolean => a !== b
    super(callback)
  }
}

/**
 * Performs a "less than" comparison ("<") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export class LessThanDirective extends SerialComparisonDirective {
  constructor () {
    const callback = (a: any, b: any): boolean => a < b
    super(callback)
  }
}

/**
 * Performs a "less than or equal to" comparison ("<=") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export class LessThanOrEqualToDirective extends SerialComparisonDirective {
  constructor () {
    const callback = (a: any, b: any): boolean => a <= b
    super(callback)
  }
}

/**
 * Performs a "greater than" comparison (">") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export class GreaterThanDirective extends SerialComparisonDirective {
  constructor () {
    const callback = (a: any, b: any): boolean => a > b
    super(callback)
  }
}

/**
 * Performs a "greater than or equal to" comparison (">=") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
export class GreaterThanOrEqualToDirective extends SerialComparisonDirective {
  constructor () {
    const callback = (a: any, b: any): boolean => a >= b
    super(callback)
  }
}

/**
 * This covers a the endpoint of a value range and a positon to compare to that range.
 * @template T
 * @interface
 * @property {T} min - minimum value of range
 * @property {T} max - maximum value of range
 * @property {T} value - target value to be evaluated
 */
export interface ValueInRangeParams<T = any> {
  min: T
  max: T
  value: T
}

/**
 * This directive checks if a value falls between a given minimum and maximum.
 * This makes it functionality equivalent to "min <= value && value <= max".
 * @class
 * @implements {KeyedTemplateDirective<ValueInRangeParams, boolean>}
 */
export class ValueInRangeDirective implements KeyedTemplateDirective<ValueInRangeParams, boolean> {
  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): ValueInRangeParams {
    return {
      min: resolver.resolveValue(params.min, context),
      max: resolver.resolveValue(params.max, context),
      value: resolver.resolveValue(params.value, context)
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): boolean {
    const spec = this.processParams(params, context, resolver)
    return spec.min <= spec.value && spec.value <= spec.max
  }
}
