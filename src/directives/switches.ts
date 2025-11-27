import {
  type KeyedTemplateResolver,
  type KeyedTemplateDirective,
  type ObjectResolutionState
} from '../resolver/template-resolver'
import {
  type KeyValueMap
} from '../resolver/basic-types'
import {
  type MultiStepParams,
  MultiStepDirective
} from './scripting'

/**
 * This describes the potential contents of a case block within a switch statement.
 * @interface
 * @property {any} case - value to be matched against when evaluating this block
 */
export interface SwitchDirectiveBlock extends MultiStepParams {
  case?: any
}

/**
 * Cover the state of switch resolution just before case blocks are processed.
 * @interface
 * @property {any} value - value to be compared to each case
 * @property {unknown[]} cases - case blocks to be compared to the target value
 */
export interface SwitchDirectiveFork {
  value: any
  cases: unknown[]
}

/**
 * This directive mimics the behavior of a javascript switch statement.
 * @class
 * @implements {KeyedTemplateDirective<SwitchDirectiveFork>}
 */
export class SwitchDirective implements KeyedTemplateDirective<SwitchDirectiveFork> {
  protected _stepHandler: MultiStepDirective

  constructor (exitIds: string[] = []) {
    this._stepHandler = new MultiStepDirective(exitIds)
  }

  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): SwitchDirectiveFork {
    const state = resolver.getResolutionState(context)
    return {
      value: resolver.processParameter(
        params,
        'value',
        (value) => resolver.resolveValue(value, context),
        state
      ),
      cases: resolver.processParameter(
        params,
        'cases',
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
    const localContext = resolver.createLocalContext(context)
    const state = resolver.setParentStateOf({ source: spec.cases }, localContext)
    resolver.setResolutionState(localContext, state)
    let matched = false
    let defaultBlock: SwitchDirectiveBlock | undefined
    for (state.index = 0; state.index < spec.cases.length; state.index++) {
      const item = spec.cases[state.index]
      const block = this.getCaseBlock(item, localContext, resolver)
      if ('case' in block) {
        if (!matched) {
          matched = (block.case === spec.value)
        }
        if (matched) {
          const result = this._stepHandler.runSteps(
            block.steps,
            localContext,
            resolver
          )
          if (result.directiveId != null) {
            return result.value
          }
        }
      } else if (defaultBlock == null) {
        defaultBlock = block
      }
    }
    if (!matched && defaultBlock != null) {
      const result = this._stepHandler.runSteps(
        defaultBlock.steps,
        localContext,
        resolver
      )
      return result
    }
  }

  /**
   * Converts a value to a case block.
   * @function
   * @param {unknown} source - value to be converted
   * @param {KeyValueMap} context - extra data to be made available for resolution
   * @param {KeyedTemplateResolver} resolver - template resolver to be used
   * @returns {SwitchDirectiveBlock} converted value as a case block
   */
  getCaseBlock (
    source: unknown,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): SwitchDirectiveBlock {
    if (typeof source === 'object' && source != null) {
      if (Array.isArray(source)) {
        return {
          steps: source
        }
      }
      const valueMap = source as KeyValueMap
      const state: ObjectResolutionState = { source: valueMap }
      const subcontext = resolver.createChildStateContext(context, state)
      const result: SwitchDirectiveBlock = {
        steps: resolver.processParameter(
          valueMap,
          'steps',
          (value) => resolver.getArray(value, subcontext),
          state
        )
      }
      if ('case' in valueMap) {
        result.case = resolver.processParameter(
          valueMap,
          'case',
          (value) => resolver.resolveValue(value, subcontext),
          state
        )
      }
      return result
    }
    return {
      steps: source !== undefined ? [source] : []
    }
  }
}
