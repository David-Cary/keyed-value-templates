import { type KeyedTemplateDirective } from '../resolver/template-resolver'
import {
  GetNestedValueDirective,
  GetLocalVariableDirective
} from './lookup'
import {
  TypeConversionDirective,
  CallbackDirective,
  LiteralValueDirective,
  ResolveValueDirective
} from './typing'
import { IfThenDirective } from './conditionals'
import { FunctionCallDirective } from './functions'
import {
  EqualityDirective,
  StrictEqualityDirective,
  InequalityDirective,
  StrictInequalityDirective,
  LessThanDirective,
  LessThanOrEqualToDirective,
  GreaterThanDirective,
  GreaterThanOrEqualToDirective,
  ValueInRangeDirective
} from './comparisons'
import {
  AdditionDirective,
  SubtractionDirective,
  MultiplicationDirective,
  ExponentiationDirective,
  DivisionDirective,
  RemainderDirective,
  AndOperatorDirective,
  OrOperatorDirective,
  NullishCoalescingDirective,
  NegationOperatorDirective
} from './operators'
import {
  MultiStepDirective,
  ReturnValueDirective,
  SignalDirective,
  SetLocalValueDirective,
  IterationDirective,
  RepetitionDirective,
  LoopingDirectiveExitPriority
} from './scripting'
import { SwitchDirective } from './switches'
export * from './lookup'
export * from './typing'
export * from './conditionals'
export * from './strings'
export * from './functions'
export * from './comparisons'
export * from './operators'
export * from './presentation'
export * from './scripting'
export * from './switches'

export const DEFAULT_LOOP_EXITS = {
  continue: LoopingDirectiveExitPriority.BREAK_PASS,
  break: LoopingDirectiveExitPriority.EXIT_LOOP,
  return: LoopingDirectiveExitPriority.RETURN_VALUE
}

export const DEFAULT_DIRECTIVES: Record<string, KeyedTemplateDirective> = {
  '==': new EqualityDirective(),
  '===': new StrictEqualityDirective(),
  '!=': new InequalityDirective(),
  '!==': new StrictInequalityDirective(),
  '<': new LessThanDirective(),
  '<=': new LessThanOrEqualToDirective(),
  '>': new GreaterThanDirective(),
  '>=': new GreaterThanOrEqualToDirective(),
  '+': new AdditionDirective(),
  '-': new SubtractionDirective(),
  '*': new MultiplicationDirective(),
  '**': new ExponentiationDirective(),
  '/': new DivisionDirective(),
  '%': new RemainderDirective(),
  and: new AndOperatorDirective(),
  between: new ValueInRangeDirective(),
  break: new SignalDirective(),
  call: new FunctionCallDirective(),
  callback: new CallbackDirective(),
  coalesce: new NullishCoalescingDirective(),
  continue: new SignalDirective(),
  cast: new TypeConversionDirective(),
  get: new GetNestedValueDirective(),
  getVar: new GetLocalVariableDirective(),
  if: new IfThenDirective(),
  forEach: new IterationDirective(DEFAULT_LOOP_EXITS),
  not: new NegationOperatorDirective(),
  or: new OrOperatorDirective(),
  repeat: new RepetitionDirective(DEFAULT_LOOP_EXITS),
  resolve: new ResolveValueDirective(),
  return: new ReturnValueDirective(),
  run: new MultiStepDirective(['return']),
  set: new SetLocalValueDirective(),
  switch: new SwitchDirective(['break', 'return']),
  value: new LiteralValueDirective()
}
