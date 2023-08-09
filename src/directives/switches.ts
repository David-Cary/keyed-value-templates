import {
  type KeyedTemplateResolver,
  type KeyedTemplateDirective
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
    return {
      value: resolver.resolveValue(params.value, context),
      cases: resolver.getArray(params.cases, context)
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    const localContext = resolver.createLocalContext(context)
    let matched = false
    let defaultBlock: SwitchDirectiveBlock | undefined
    for (const item of spec.cases) {
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
      const result: SwitchDirectiveBlock = {
        steps: resolver.getArray(valueMap.steps, context)
      }
      if ('case' in valueMap) {
        result.case = resolver.resolveValue(valueMap.case, context)
      }
      return result
    }
    return {
      steps: source !== undefined ? [source] : []
    }
  }
}
