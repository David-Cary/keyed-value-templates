import {
  type KeyedTemplateResolver,
  type KeyedTemplateDirective,
  type ObjectResolutionState,
  type TemplateOptimizationResult
} from '../resolver/template-resolver'
import {
  type KeyValueMap,
  type AnyObject
} from '../resolver/basic-types'
import {
  type PropertyLookupStep,
  type PropertyOwner,
  GetNestedValueDirective
} from './lookup'
import { type ValueWrapper } from './typing'

/**
 * Acts as a wrapper for the steps needed to complete a set of scripted actions.
 * @interface
 * @property {unknown[]} steps - actions to be performed
 */
export interface MultiStepParams {
  steps: unknown[]
}

/**
 * Covers the details of any item that may have triggered early termination of a set of scripted actions.
 * @interface
 * @property {unknown} args - target argument list
 */
export interface MultiStepDirectiveExit {
  directiveId: string
  value: unknown
}

/**
 * This directive executes a predetermined sequence of directive requests until it reaches the end of that list or runs into a recognized termination directive.
 * @class
 * @implements {KeyedTemplateDirective<MultiStepParams>}
 * @property {string[]} exitIds - list of directive ids that should be recognized as termination directives
 */
export class MultiStepDirective implements KeyedTemplateDirective<MultiStepParams> {
  readonly exitIds: string[]

  constructor (exitIds: string[] = []) {
    this.exitIds = exitIds
  }

  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): MultiStepParams {
    const state = resolver.getResolutionState(context)
    return {
      steps: resolver.processParameter(
        params,
        'steps',
        (value) => resolver.getArray(value, context),
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
    const result = this.runSteps(spec.steps, context, resolver)
    return result.value
  }

  /**
   * Processes the provided set of directive requests for a given context.
   * @function
   * @param {unknown[]} steps - actions to be executed
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @param {KeyedTemplateResolver} resolver - template resolver to be used
   * @returns {Partial<MultiStepDirectiveExit>} information on what action triggered an early termination (object is empty if script completed normally)
   */
  runSteps (
    steps: unknown[],
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): Partial<MultiStepDirectiveExit> {
    const localContext = resolver.createLocalContext(context)
    const state = resolver.setParentStateOf({ source: steps }, localContext)
    resolver.setResolutionState(localContext, state)
    for (state.index = 0; state.index < steps.length; state.index++) {
      const step = steps[state.index]
      const directiveId = resolver.getDirectiveIdFor(step)
      const value = resolver.resolveValue(step, localContext)
      if (directiveId != null && this.exitIds.includes(directiveId)) {
        return {
          directiveId,
          value
        }
      }
    }
    return {}
  }
}

/**
 * These directives return a predetermined value each time they're executed.
 * These can be treated as constants or used as minimalist placeholder directives.
 * @class
 * @implements {KeyedTemplateDirective}
 * @property {unknown} value - value to be returned on execution of this directive
 */
export class SignalDirective implements KeyedTemplateDirective {
  readonly value: unknown

  constructor (value?: unknown) {
    this.value = value
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    return resolver.createDeepCopy(this.value)
  }

  optimizeTemplate (
    params: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): TemplateOptimizationResult {
    return {
      executable: false,
      value: resolver.createDeepCopy(params)
    }
  }
}

/**
 * These act as wrappers for another value, returning the resolved version of the value on execution.
 * They're primarily used to attach a directive marker to particular value without modifying it.
 * @class
 * @implements {KeyedTemplateDirective<IfThenFork>}
 */
export class ReturnValueDirective implements KeyedTemplateDirective<ValueWrapper> {
  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): ValueWrapper {
    const state = resolver.getResolutionState(context)
    return {
      value: resolver.processParameter(
        params,
        'value',
        (value) => resolver.resolveValue(value, context),
        state
      )
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const result = resolver.resolveValue(params.value, context)
    return result
  }

  optimizeTemplate (
    params: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): TemplateOptimizationResult {
    return {
      executable: false,
      value: resolver.createDeepCopy(params)
    }
  }
}

/**
 * Priority values for determining how to handle requests to end LoopingDirective execution.
 * @enum {number}
 */
export enum LoopingDirectiveExitPriority {
  /** ignore value, used to signal no exit should take place */
  NONE = 0,
  /** signals the current pass should end but be immediately followed by the next pass */
  BREAK_PASS,
  /** signals both current and further iteration should end */
  EXIT_LOOP,
  /** signals both that iteration should end and that the triggering action should override the default return value */
  RETURN_VALUE
}

/**
 * Adds a priority rating to MultiStepDirectiveExit data.
 * @interface
 * @property {LoopingDirectiveExitPriority} priority - indicates how the exit should be handled by the loop
 */
export interface LoopingDirectiveExit extends MultiStepDirectiveExit {
  priority: LoopingDirectiveExitPriority
}

/**
 * Base class for directives that repeat a given sequence of actions until certain conditions are met.
 * @class
 * @implements {KeyedTemplateDirective<IfThenFork>}
 */
export class LoopingDirective extends MultiStepDirective {
  readonly exitPriorities: Record<string, LoopingDirectiveExitPriority>

  constructor (
    exitPriorities: Record<string, LoopingDirectiveExitPriority> = {}
  ) {
    const exitIds: string[] = []
    for (const key in exitPriorities) {
      const priority = exitPriorities[key]
      if (priority >= LoopingDirectiveExitPriority.BREAK_PASS) {
        exitIds.push(key)
      }
    }
    super(exitIds)
    this.exitPriorities = exitPriorities
  }

  /**
   * Cycles through the provided steps and prioritizes any exit signal generated by that pass.
   * The exit signal handling is primarily what distinguishes it from runSteps, though it does also ensure other exit data is initialized.
   * @function
   * @param {unknown[]} steps - actions to be executed
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @param {KeyedTemplateResolver} resolver - template resolver to be used
   * @returns {Partial<MultiStepDirectiveExit>} information on what action triggered an early termination (object is empty if script completed normally)
   */
  runPass (
    steps: unknown[],
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): LoopingDirectiveExit {
    const result = this.runSteps(steps, context, resolver)
    return {
      directiveId: result.directiveId ?? '',
      value: result?.directiveId,
      priority: result?.directiveId != null
        ? this.exitPriorities[result.directiveId]
        : 0
    }
  }
}

/**
 * Adds iteration target and return value to MultiStepParams.
 * @interface
 * @property {unknown} for - iteration target
 * @property {unknown} return - value to return if iteration completes normally
 */
export interface IterationParams extends MultiStepParams {
  for: unknown
  return: unknown
}

/**
 * This directive repeats the provided steps over each item in the target collection.
 * This iteration uses a local context with a '$value' variable and either an '$index' or '$key' variable, depending on whether or not the collection is an array.
 * @class
 * @implements {KeyedTemplateDirective<LoopingDirective>}
 */
export class IterationDirective extends LoopingDirective {
  constructor (
    exitPriorities: Record<string, LoopingDirectiveExitPriority> = {}
  ) {
    super(exitPriorities)
  }

  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): IterationParams {
    const state = resolver.getResolutionState(context)
    return {
      steps: resolver.processParameter(
        params,
        'steps',
        (value) => resolver.getArray(value, context),
        state
      ),
      for: resolver.processParameter(
        params,
        'for',
        (value) => resolver.executeDirectiveFor(value, context),
        state
      ),
      return: params.return
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    if (typeof spec.for === 'object' && spec.for != null) {
      const localContext = resolver.createLocalContext(context)
      let result: LoopingDirectiveExit | undefined
      if (Array.isArray(spec.for)) {
        const state = resolver.setParentStateOf({ source: spec.for }, localContext)
        resolver.setResolutionState(localContext, state)
        for (state.index = 0; state.index < spec.for.length; state.index++) {
          resolver.setLocalValue(localContext, '$index', state.index)
          resolver.setLocalValue(localContext, '$value', spec.for[state.index])
          result = this.runPass(spec.steps, localContext, resolver)
          if (result.priority >= LoopingDirectiveExitPriority.EXIT_LOOP) break
        }
      } else {
        const valueMap = spec.for as KeyValueMap
        const state = resolver.setParentStateOf({ source: valueMap }, localContext)
        resolver.setResolutionState(localContext, state)
        for (const key in valueMap) {
          state.property = key
          resolver.setLocalValue(localContext, '$key', key)
          resolver.setLocalValue(localContext, '$value', valueMap[key])
          result = this.runPass(spec.steps, localContext, resolver)
          if (result.priority >= LoopingDirectiveExitPriority.EXIT_LOOP) break
        }
      }
      if (result != null && result.priority >= LoopingDirectiveExitPriority.RETURN_VALUE) {
        return result.value
      }
      const defaultValue = resolver.resolveValue(spec.return, localContext)
      return defaultValue
    }
  }
}

/**
 * Adds a rate, range, and return value to MultiStepParams for iterating over said range.
 * @interface
 * @property {number} from - starting position for iteration
 * @property {number} to - ending positon for iteration
 * @property {number} rate - amount to adjust iteration value on each pass
 * @property {unknown} return - value to return if iteration completes normally
 */
export interface RepetitionParams extends MultiStepParams {
  from: number
  to: number
  rate: number
  return: unknown
}

/**
 * This directive repeats the provided steps for numbers within a given range.
 * This iteration uses a local context with an '$index' variable for the current value.
 * @class
 * @implements {KeyedTemplateDirective<IfThenFork>}
 */
export class RepetitionDirective extends LoopingDirective {
  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): RepetitionParams {
    const state = resolver.getResolutionState(context)
    return {
      steps: resolver.processParameter(
        params,
        'steps',
        (value) => resolver.getArray(value, context),
        state
      ),
      from: resolver.processParameter(
        params,
        'from',
        (value) => this.resolveNumber(value, context, resolver, 1),
        state
      ),
      to: resolver.processParameter(
        params,
        'to',
        (value) => this.resolveNumber(value, context, resolver, 1),
        state
      ),
      rate: resolver.processParameter(
        params,
        'rate',
        (value) => this.resolveNumber(value, context, resolver, 1),
        state
      ),
      return: params.return
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    const state = resolver.getResolutionState(context)
    if (state != null) state.property = undefined
    const localContext = resolver.createLocalContext(context)
    let result: LoopingDirectiveExit | undefined
    this.forRange(
      spec.from,
      spec.to,
      (index: number) => {
        resolver.setLocalValue(localContext, '$index', index)
        result = this.runPass(spec.steps, localContext, resolver)
        return result.priority < LoopingDirectiveExitPriority.EXIT_LOOP
      },
      spec.rate
    )
    if (result != null && result.priority >= LoopingDirectiveExitPriority.RETURN_VALUE) {
      return result.value
    }
    const defaultValue = resolver.resolveValue(spec.return, localContext)
    return defaultValue
  }

  /**
   * Tries to convert the resolved version of the target value to a number.
   * @function
   * @param {unknown} value - value to be resolved and converted
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @param {KeyedTemplateResolver} resolver - template resolver to be used
   * @param {number} defaultValue - number to use if resolved value is not a number
   * @returns {number} converted value
   */
  resolveNumber (
    value: unknown,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver,
    defaultValue = 0
  ): number {
    const resolvedValue = resolver.resolveValue(value, context)
    if (typeof resolvedValue === 'number') return resolvedValue
    const num = Number(resolvedValue)
    return isNaN(num) ? defaultValue : defaultValue
  }

  /**
   * Iterates over the provided range.  This includes adjusting the iteration rate to the range's direction.
   * @function
   * @param {number} startIndex - starting position for iteration
   * @param {number} endIndex - ending positon for iteration
   * @param {(index: number) => boolean | undefined} callback - Callback to be performed for each iterated value.  Aborts execution if this returns false.
   * @param {number} rate - amount to adjust iteration value on each pass
   */
  forRange (
    startIndex: number,
    endIndex: number,
    callback: (index: number) => boolean | undefined,
    rate = 1
  ): void {
    const absRate = Math.abs(rate)
    const validRate = absRate > 0 ? absRate : 1
    if (startIndex <= endIndex) {
      for (let index = startIndex; index <= endIndex; index += validRate) {
        const result = callback(index)
        if (result === false) break
      }
    } else {
      for (let index = startIndex; index >= endIndex; index -= validRate) {
        const result = callback(index)
        if (result === false) break
      }
    }
  }
}

/**
 * Specifies the path to a given nested value and what it should be set to.
 * @interface
 * @property {unknown} source - root object to be modified
 * @property {unknown[]} path - steps to the value's destination
 * @property {unknown} value - value to be stored
 * @property {boolean} populate - signals whether subcontainers should be created
 */
export interface SetNestedValueParams {
  source: unknown
  path: unknown[]
  value: unknown
  populate: boolean
}

/**
 * This directive tries to assign a value to a particular path within the current context's local variables.
 * @class
 * @implements {KeyedTemplateDirective<SetNestedValueParams>}
 */
export class SetLocalValueDirective implements KeyedTemplateDirective<SetNestedValueParams> {
  protected _getter = new GetNestedValueDirective()

  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): SetNestedValueParams {
    const state = resolver.getResolutionState(context)
    return {
      source: context[resolver.localVariablesKey],
      path: resolver.processParameter(
        params,
        'path',
        (value) => resolver.getArray(value, context),
        state
      ),
      value: params.value,
      populate: resolver.processParameter(
        params,
        'populate',
        (value) => resolver.resolveTypedValue(value, context, Boolean),
        state
      )
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): void {
    const spec = this.processParams(params, context, resolver)
    this.setUnresolvedValue(
      spec.source,
      spec.path,
      spec.value,
      context,
      resolver,
      spec.populate
    )
  }

  /**
   * Uses a validated path to try setting the target value within the provided source.
   * @function
   * @param {unknown} source - expected container for the target value
   * @param {unknown[]} path - steps to reach the target value
   * @param {unknown} value - value to be assigned
   * @param {boolean} populate - signals whether subcontainers should be created
   */
  setNestedValue (
    source: unknown,
    path: PropertyLookupStep[],
    value: unknown,
    populate = false
  ): void {
    if (path.length > 0) {
      let target: unknown = source
      const maxIndex = path.length - 1
      for (let i = 0; i < maxIndex; i++) {
        if (target != null) {
          const step = path[i]
          const parent = target as PropertyOwner
          target = this._getter.resolveStep(parent, step)
          if (target == null && populate) {
            target = typeof path[i + 1] === 'number' ? [] : {}
            this.setObjectProperty(parent as AnyObject, step, target)
          }
        } else break
      }
      if (target != null) {
        const step = path[maxIndex]
        this.setObjectProperty(target as AnyObject, step, value)
      }
    }
  }

  /**
   * Tries to set a nested property via an unresolved path and value.
   * The main advantages of using this over resolving everything and using setNestedValue
   * are that it will skip resolution if there's an invalid step and that it updates the
   * context's resolution state.
   * @function
   * @param {unknown} source - root object for the target property
   * @param {unknown[]} path - unresolved path to the target property
   * @param {unknown} value - value to be assigned
   * @param {KeyValueMap} context - extra resolution data
   * @param {KeyedTemplateResolver} resolver - template resolver to be used
   * @param {boolean} populate - signals whether subcontainers should be created
   */
  setUnresolvedValue (
    source: unknown,
    path: unknown[],
    value: unknown,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver,
    populate = false
  ): void {
    if (path.length > 0) {
      const state: ObjectResolutionState = { source: path }
      const subcontext = resolver.createChildStateContext(context, state)
      let target: unknown = source ?? subcontext
      const maxIndex = path.length - 1
      if (state.parent != null) state.parent.property = 'path'
      for (state.index = 0; state.index < maxIndex; state.index++) {
        const step = path[state.index]
        if (target != null) {
          const resolvedStep = resolver.resolveValue(step, subcontext)
          const validStep = this._getter.getValidStepFrom(resolvedStep)
          if (validStep != null) {
            const parent = target as PropertyOwner
            target = this._getter.resolveStep(parent, validStep)
            if (target == null && populate) {
              target = typeof path[state.index + 1] === 'number' ? [] : {}
              this.setObjectProperty(parent as AnyObject, validStep, target)
            }
          } else {
            target = null
            break
          }
        }
      }
      if (target != null) {
        const step = path[maxIndex]
        const resolvedStep = resolver.resolveValue(step, subcontext)
        const validStep = this._getter.getValidStepFrom(resolvedStep)
        if (validStep != null) {
          if (state.parent != null) state.parent.property = 'value'
          const resolvedValue = resolver.resolveValue(value, context)
          this.setObjectProperty(target as AnyObject, validStep, resolvedValue)
        }
      }
      if (state.parent != null) state.parent.property = undefined
    }
  }

  /**
   * Attaches the provided value to a property of the target object.
   * @function
   * @param {AnyObject} target - object value should be attached to
   * @param {PropertyLookupStep} step - indicates how the value should be assigned
   * @param {unknown} value - value to be assigned
   */
  setObjectProperty (
    target: AnyObject,
    step: PropertyLookupStep,
    value: unknown
  ): void {
    if (Array.isArray(target)) {
      this.setArrayItem(target, step, value)
    } else if (typeof step === 'object') {
      this._getter.resolvePropertyCall(target, step)
    } else {
      target[step] = value
    }
  }

  /**
   * Inserts the provided value into the target array.
   * @function
   * @param {AnyObject} target - array value should be inserted into
   * @param {PropertyLookupStep} step - indicates how the value should be inserted
   * @param {unknown} value - value to be inserted
   */
  setArrayItem (
    target: unknown[],
    step: PropertyLookupStep,
    value: unknown
  ): void {
    if (typeof step === 'object') {
      const callback = (target as any)[step.name]
      if (typeof callback === 'function') {
        const args = (step.args != null) ? step.args : []
        callback.apply(target, args)
        return
      }
    }
    const index = Number(step)
    target[index] = value
  }
}
