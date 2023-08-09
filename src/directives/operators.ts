import {
  type KeyedTemplateResolver,
  type KeyedTemplateDirective
} from '../resolver/template-resolver'
import {
  type KeyValueMap
} from '../resolver/basic-types'
import { type ArgumentsWrapper } from './comparisons'
import { type ValueWrapper } from './typing'

export type RepeatableOperationDirectiveCallback<T = unknown> = (a: T, b: T) => T

/**
 * This directive performs the target operation on all provided arguments, working from the first pair to the last argument.
 * This involves applying the operation to the first two argument, then repeating for the previous results and the next available argument.
 * @class
 * @implements {KeyedTemplateDirective<ArgumentsWrapper>}
 * @property {RepeatableOperationDirectiveCallback} callback - operation to be applied to each pairing
 * @property {(value: unknown) => boolean} checkExitSignal - optional callback that should return true if we should stop iterating through the arguments when a certain value is found

 */
export class RepeatedOperationDirective implements KeyedTemplateDirective<ArgumentsWrapper> {
  readonly callback: RepeatableOperationDirectiveCallback

  readonly checkExitSignal?: (value: unknown) => boolean

  constructor (
    callback: RepeatableOperationDirectiveCallback,
    checkExitSignal?: (value: unknown) => boolean
  ) {
    this.callback = callback
    this.checkExitSignal = checkExitSignal
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
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    if (spec.args.length > 0) {
      let left = resolver.resolveValue(spec.args[0], context)
      for (let i = 1; i < spec.args.length; i++) {
        if (this.checkExitSignal?.(left) === true) {
          break
        }
        const right = resolver.resolveValue(spec.args[i], context)
        left = this.callback(left, right)
      }
      return left
    }
  }
}

/**
 * This works as a more general RepeatedOperationDirective, with the exception that it converts arguments to a particular type before performing the operation.
 * @class
 * @template T
 * @implements {KeyedTemplateDirective<ArgumentsWrapper>}
 * @property {(value: unknown) => T} convertor - callback to convert arguments to the target type
 * @property {RepeatableOperationDirectiveCallback} callback - operation to be applied to each pairing
 * @property {(value: unknown) => boolean} checkExitSignal - optional callback that should return true if we should stop iterating through the arguments when a certain value is found
 */
export class TypedRepeatedOperationDirective<T> implements KeyedTemplateDirective<ArgumentsWrapper> {
  readonly convertor: (value: unknown) => T

  readonly callback: RepeatableOperationDirectiveCallback<T>

  readonly checkExitSignal?: (value: T) => boolean

  constructor (
    convertor: (value: unknown) => T,
    callback: RepeatableOperationDirectiveCallback<T>,
    checkExitSignal?: (value: T) => boolean
  ) {
    this.convertor = convertor
    this.callback = callback
    this.checkExitSignal = checkExitSignal
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
  ): T | undefined {
    const spec = this.processParams(params, context, resolver)
    if (spec.args.length > 0) {
      let left = resolver.resolveTypedValue(spec.args[0], context, this.convertor)
      for (let i = 1; i < spec.args.length; i++) {
        if (this.checkExitSignal?.(left) === true) {
          break
        }
        const right = resolver.resolveTypedValue(spec.args[i], context, this.convertor)
        left = this.callback(left, right)
      }
      return left
    }
  }
}

export type CommonKey = string | number

/**
 * Converts a value into either a string or number if it's not one already.
 * @function
 * @param {unknown} source - value to be converted
 * @returns {CommonKey} converted value
 */
export function castToCommonKey (source: unknown): CommonKey {
  switch (typeof source) {
    case 'string':
    case 'number': {
      return source
    }
    default: {
      return String(source)
    }
  }
}

/**
 * Adds up all provided arguments.
 * @class
 * @implements {TypedRepeatedOperationDirective<CommonKey>}
 */
export class AdditionDirective extends TypedRepeatedOperationDirective<CommonKey> {
  constructor () {
    const callback = (a: CommonKey, b: CommonKey): CommonKey => {
      if (typeof a === 'string') {
        return typeof b === 'string' ? a + b : a + String(b)
      }
      return typeof b === 'string' ? String(a) + b : a + b
    }
    super(castToCommonKey, callback)
  }
}

/**
 * Subtracts all following arguments from the first argument.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
export class SubtractionDirective extends TypedRepeatedOperationDirective<number> {
  constructor () {
    const callback = (a: number, b: number): number => a - b
    super(Number, callback)
  }
}

/**
 * Multiplies all provided arguments.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
export class MultiplicationDirective extends TypedRepeatedOperationDirective<number> {
  constructor () {
    const callback = (a: number, b: number): number => a * b
    super(Number, callback)
  }
}

/**
 * Raises the previous argument to the power of the next argument.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
export class ExponentiationDirective extends TypedRepeatedOperationDirective<number> {
  constructor () {
    const callback = (a: number, b: number): number => a ** b
    super(Number, callback)
  }
}

/**
 * Divides the first argument by all following arguments.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
export class DivisionDirective extends TypedRepeatedOperationDirective<number> {
  constructor () {
    const callback = (a: number, b: number): number => a / b
    super(Number, callback)
  }
}

/**
 * Get the remainder of the first argument when divided by all following arguments.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
export class RemainderDirective extends TypedRepeatedOperationDirective<number> {
  constructor () {
    const callback = (a: number, b: number): number => a % b
    super(Number, callback)
  }
}

/**
 * Returns true if and only if all arguments are true.
 * @class
 * @implements {TypedRepeatedOperationDirective<boolean>}
 */
export class AndOperatorDirective extends TypedRepeatedOperationDirective<boolean> {
  constructor () {
    const callback = (a: boolean, b: boolean): boolean => a && b
    const checkExitSignal = (value: boolean): boolean => !value
    super(Boolean, callback, checkExitSignal)
  }
}

/**
 * Returns true if any of the arguments are true.
 * @class
 * @implements {TypedRepeatedOperationDirective<boolean>}
 */
export class OrOperatorDirective extends TypedRepeatedOperationDirective<boolean> {
  constructor () {
    const callback = (a: boolean, b: boolean): boolean => a || b
    const checkExitSignal = (value: boolean): boolean => value
    super(Boolean, callback, checkExitSignal)
  }
}

/**
 * Returns the first non-null argument found.
 * @class
 * @implements {RepeatedOperationDirective}
 */
export class NullishCoalescingDirective extends RepeatedOperationDirective {
  constructor () {
    const callback = (a: unknown, b: unknown): unknown => a ?? b
    const checkExitSignal = (value: unknown): boolean => value != null
    super(callback, checkExitSignal)
  }
}

/**
 * Negates the boolean equivalent of a given value.
 * @class
 * @implements {KeyedTemplateDirective<ValueWrapper, boolean>}
 */
export class NegationOperatorDirective implements KeyedTemplateDirective<ValueWrapper, boolean> {
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
  ): boolean {
    const resolvedValue = resolver.resolveValue(params.value, context)
    const castValue = Boolean(resolvedValue)
    return !castValue
  }
}
