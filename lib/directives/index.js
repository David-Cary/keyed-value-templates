"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DIRECTIVES = exports.DEFAULT_LOOP_EXITS = void 0;
var lookup_1 = require("./lookup");
var typing_1 = require("./typing");
var conditionals_1 = require("./conditionals");
var functions_1 = require("./functions");
var comparisons_1 = require("./comparisons");
var operators_1 = require("./operators");
var scripting_1 = require("./scripting");
var switches_1 = require("./switches");
__exportStar(require("./lookup"), exports);
__exportStar(require("./typing"), exports);
__exportStar(require("./conditionals"), exports);
__exportStar(require("./strings"), exports);
__exportStar(require("./functions"), exports);
__exportStar(require("./comparisons"), exports);
__exportStar(require("./operators"), exports);
__exportStar(require("./scripting"), exports);
__exportStar(require("./switches"), exports);
exports.DEFAULT_LOOP_EXITS = {
    continue: scripting_1.LoopingDirectiveExitPriority.BREAK_PASS,
    break: scripting_1.LoopingDirectiveExitPriority.EXIT_LOOP,
    return: scripting_1.LoopingDirectiveExitPriority.RETURN_VALUE
};
exports.DEFAULT_DIRECTIVES = {
    '==': new comparisons_1.EqualityDirective(),
    '===': new comparisons_1.StrictEqualityDirective(),
    '!=': new comparisons_1.InequalityDirective(),
    '!==': new comparisons_1.StrictInequalityDirective(),
    '<': new comparisons_1.LessThanDirective(),
    '<=': new comparisons_1.LessThanOrEqualToDirective(),
    '>': new comparisons_1.GreaterThanDirective(),
    '>=': new comparisons_1.GreaterThanOrEqualToDirective(),
    '+': new operators_1.AdditionDirective(),
    '-': new operators_1.SubtractionDirective(),
    '*': new operators_1.MultiplicationDirective(),
    '**': new operators_1.ExponentiationDirective(),
    '/': new operators_1.DivisionDirective(),
    '%': new operators_1.RemainderDirective(),
    and: new operators_1.AndOperatorDirective(),
    between: new comparisons_1.ValueInRangeDirective(),
    break: new scripting_1.SignalDirective(),
    call: new functions_1.FunctionCallDirective(),
    callback: new typing_1.CallbackDirective(),
    coalesce: new operators_1.NullishCoalescingDirective(),
    continue: new scripting_1.SignalDirective(),
    cast: new typing_1.TypeConversionDirective(),
    get: new lookup_1.GetNestedValueDirective(),
    getVar: new lookup_1.GetLocalVariableDirective(),
    if: new conditionals_1.IfThenDirective(),
    forEach: new scripting_1.IterationDirective(exports.DEFAULT_LOOP_EXITS),
    not: new operators_1.NegationOperatorDirective(),
    or: new operators_1.OrOperatorDirective(),
    repeat: new scripting_1.RepetitionDirective(exports.DEFAULT_LOOP_EXITS),
    resolve: new typing_1.ResolveValueDirective(),
    return: new scripting_1.ReturnValueDirective(),
    run: new scripting_1.MultiStepDirective(['return']),
    set: new scripting_1.SetLocalValueDirective(),
    switch: new switches_1.SwitchDirective(['break', 'return']),
    value: new typing_1.LiteralValueDirective()
};
