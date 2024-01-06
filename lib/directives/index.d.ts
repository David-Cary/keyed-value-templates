import { type KeyedTemplateDirective } from '../resolver/template-resolver';
import { LoopingDirectiveExitPriority } from './scripting';
export * from './lookup';
export * from './typing';
export * from './conditionals';
export * from './strings';
export * from './functions';
export * from './comparisons';
export * from './operators';
export * from './presentation';
export * from './scripting';
export * from './switches';
export declare const DEFAULT_LOOP_EXITS: {
    continue: LoopingDirectiveExitPriority;
    break: LoopingDirectiveExitPriority;
    return: LoopingDirectiveExitPriority;
};
export declare const DEFAULT_DIRECTIVES: Record<string, KeyedTemplateDirective>;
