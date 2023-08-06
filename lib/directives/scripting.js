"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetLocalValueDirective = exports.RepetitionDirective = exports.IterationDirective = exports.LoopingDirective = exports.LoopingDirectiveExitPriority = exports.ReturnValueDirective = exports.SignalDirective = exports.MultiStepDirective = void 0;
var lookup_1 = require("./lookup");
/**
 * This directive executes a predetermined sequence of directive requests until it reaches the end of that list or runs into a recognized termination directive.
 * @class
 * @implements {KeyedTemplateDirective<MultiStepParams>}
 * @property {string[]} exitIds - list of directive ids that should be recognized as termination directives
 */
var MultiStepDirective = /** @class */ (function () {
    function MultiStepDirective(exitIds) {
        if (exitIds === void 0) { exitIds = []; }
        this.exitIds = exitIds;
    }
    MultiStepDirective.prototype.processParams = function (params, context, resolver) {
        return {
            steps: resolver.getArray(params.steps, context)
        };
    };
    MultiStepDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        var localContext = resolver.createLocalContext(context);
        var result = this.runSteps(spec.steps, localContext, resolver);
        return result.value;
    };
    /**
     * Processes the provided set of directive requests for a given context.
     * @function
     * @param {unknown[]} steps - actions to be executed
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @param {KeyedTemplateResolver} resolver - template resolver to be used
     * @returns {Partial<MultiStepDirectiveExit>} information on what action triggered an early termination (object is empty if script completed normally)
     */
    MultiStepDirective.prototype.runSteps = function (steps, context, resolver) {
        for (var _i = 0, steps_1 = steps; _i < steps_1.length; _i++) {
            var step = steps_1[_i];
            var directiveId = resolver.getDirectiveIdFor(step);
            var value = resolver.resolveValue(step, context);
            if (directiveId != null && this.exitIds.includes(directiveId)) {
                return {
                    directiveId: directiveId,
                    value: value
                };
            }
        }
        return {};
    };
    return MultiStepDirective;
}());
exports.MultiStepDirective = MultiStepDirective;
/**
 * These directives return a predetermined value each time they're executed.
 * These can be treated as constants or used as minimalist placeholder directives.
 * @class
 * @implements {KeyedTemplateDirective}
 * @property {unknown} value - value to be returned on execution of this directive
 */
var SignalDirective = /** @class */ (function () {
    function SignalDirective(value) {
        this.value = value;
    }
    SignalDirective.prototype.execute = function (params, context, resolver) {
        return resolver.createDeepCopy(this.value);
    };
    SignalDirective.prototype.optimizeTemplate = function (params, resolver) {
        return {
            executable: false,
            value: resolver.createDeepCopy(params)
        };
    };
    return SignalDirective;
}());
exports.SignalDirective = SignalDirective;
/**
 * These act as wrappers for another value, returning the resolved version of the value on execution.
 * They're primarily used to attach a directive marker to particular value without modifying it.
 * @class
 * @implements {KeyedTemplateDirective<IfThenFork>}
 */
var ReturnValueDirective = /** @class */ (function () {
    function ReturnValueDirective() {
    }
    ReturnValueDirective.prototype.processParams = function (params, context, resolver) {
        return {
            value: resolver.resolveValue(params.value, context)
        };
    };
    ReturnValueDirective.prototype.execute = function (params, context, resolver) {
        var result = resolver.resolveValue(params.value, context);
        return result;
    };
    ReturnValueDirective.prototype.optimizeTemplate = function (params, resolver) {
        return {
            executable: false,
            value: resolver.createDeepCopy(params)
        };
    };
    return ReturnValueDirective;
}());
exports.ReturnValueDirective = ReturnValueDirective;
/**
 * Priority values for determining how to handle requests to end LoopingDirective execution.
 * @enum {number}
 */
var LoopingDirectiveExitPriority;
(function (LoopingDirectiveExitPriority) {
    /** ignore value, used to signal no exit should take place */
    LoopingDirectiveExitPriority[LoopingDirectiveExitPriority["NONE"] = 0] = "NONE";
    /** signals the current pass should end but be immediately followed by the next pass */
    LoopingDirectiveExitPriority[LoopingDirectiveExitPriority["BREAK_PASS"] = 1] = "BREAK_PASS";
    /** signals both current and further iteration should end */
    LoopingDirectiveExitPriority[LoopingDirectiveExitPriority["EXIT_LOOP"] = 2] = "EXIT_LOOP";
    /** signals both that iteration should end and that the triggering action should override the default return value */
    LoopingDirectiveExitPriority[LoopingDirectiveExitPriority["RETURN_VALUE"] = 3] = "RETURN_VALUE";
})(LoopingDirectiveExitPriority || (exports.LoopingDirectiveExitPriority = LoopingDirectiveExitPriority = {}));
/**
 * Base class for directives that repeat a given sequence of actions until certain conditions are met.
 * @class
 * @implements {KeyedTemplateDirective<IfThenFork>}
 */
var LoopingDirective = /** @class */ (function (_super) {
    __extends(LoopingDirective, _super);
    function LoopingDirective(exitPriorities) {
        if (exitPriorities === void 0) { exitPriorities = {}; }
        var _this = this;
        var exitIds = [];
        for (var key in exitPriorities) {
            var priority = exitPriorities[key];
            if (priority >= LoopingDirectiveExitPriority.BREAK_PASS) {
                exitIds.push(key);
            }
        }
        _this = _super.call(this, exitIds) || this;
        _this.exitPriorities = exitPriorities;
        return _this;
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
    LoopingDirective.prototype.runPass = function (steps, context, resolver) {
        var _a;
        var result = this.runSteps(steps, context, resolver);
        return {
            directiveId: (_a = result.directiveId) !== null && _a !== void 0 ? _a : '',
            value: result === null || result === void 0 ? void 0 : result.directiveId,
            priority: (result === null || result === void 0 ? void 0 : result.directiveId) != null
                ? this.exitPriorities[result.directiveId]
                : 0
        };
    };
    return LoopingDirective;
}(MultiStepDirective));
exports.LoopingDirective = LoopingDirective;
/**
 * This directive repeats the provided steps over each item in the target collection.
 * This iteration uses a local context with a '$value' variable and either an '$index' or '$key' variable, depending on whether or not the collection is an array.
 * @class
 * @implements {KeyedTemplateDirective<LoopingDirective>}
 */
var IterationDirective = /** @class */ (function (_super) {
    __extends(IterationDirective, _super);
    function IterationDirective(exitPriorities) {
        if (exitPriorities === void 0) { exitPriorities = {}; }
        return _super.call(this, exitPriorities) || this;
    }
    IterationDirective.prototype.processParams = function (params, context, resolver) {
        return {
            steps: resolver.getArray(params.steps, context),
            for: resolver.executeDirectiveFor(params.for, context),
            return: params.return
        };
    };
    IterationDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        if (typeof spec.for === 'object' && spec.for != null) {
            var localContext = resolver.createLocalContext(context);
            var result = void 0;
            if (Array.isArray(spec.for)) {
                for (var index = 0; index < spec.for.length; index++) {
                    resolver.setLocalValue(localContext, '$index', index);
                    resolver.setLocalValue(localContext, '$value', spec.for[index]);
                    result = this.runPass(spec.steps, localContext, resolver);
                    if (result.priority >= LoopingDirectiveExitPriority.EXIT_LOOP)
                        break;
                }
            }
            else {
                var valueMap = spec.for;
                for (var key in valueMap) {
                    resolver.setLocalValue(localContext, '$key', key);
                    resolver.setLocalValue(localContext, '$value', valueMap[key]);
                    result = this.runPass(spec.steps, localContext, resolver);
                    if (result.priority >= LoopingDirectiveExitPriority.EXIT_LOOP)
                        break;
                }
            }
            if (result != null && result.priority >= LoopingDirectiveExitPriority.RETURN_VALUE) {
                return result.value;
            }
            var defaultValue = resolver.resolveValue(spec.return, localContext);
            return defaultValue;
        }
    };
    return IterationDirective;
}(LoopingDirective));
exports.IterationDirective = IterationDirective;
/**
 * This directive repeats the provided steps for numbers within a given range.
 * This iteration uses a local context with an '$index' variable for the current value.
 * @class
 * @implements {KeyedTemplateDirective<IfThenFork>}
 */
var RepetitionDirective = /** @class */ (function (_super) {
    __extends(RepetitionDirective, _super);
    function RepetitionDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RepetitionDirective.prototype.processParams = function (params, context, resolver) {
        return {
            steps: resolver.getArray(params.steps, context),
            from: this.resolveNumber(params.from, context, resolver, 1),
            to: this.resolveNumber(params.to, context, resolver, 1),
            rate: this.resolveNumber(params.from, context, resolver, 1),
            return: params.return
        };
    };
    RepetitionDirective.prototype.execute = function (params, context, resolver) {
        var _this = this;
        var spec = this.processParams(params, context, resolver);
        var localContext = resolver.createLocalContext(context);
        var result;
        this.forRange(spec.from, spec.to, function (index) {
            resolver.setLocalValue(localContext, '$index', index);
            result = _this.runPass(spec.steps, localContext, resolver);
            return result.priority < LoopingDirectiveExitPriority.EXIT_LOOP;
        }, spec.rate);
        if (result != null && result.priority >= LoopingDirectiveExitPriority.RETURN_VALUE) {
            return result.value;
        }
        var defaultValue = resolver.resolveValue(spec.return, localContext);
        return defaultValue;
    };
    /**
     * Tries to convert the resolved version of the target value to a number.
     * @function
     * @param {unknown} value - value to be resolved and converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @param {KeyedTemplateResolver} resolver - template resolver to be used
     * @param {number} defaultValue - number to use if resolved value is not a number
     * @returns {number} converted value
     */
    RepetitionDirective.prototype.resolveNumber = function (value, context, resolver, defaultValue) {
        if (defaultValue === void 0) { defaultValue = 0; }
        var resolvedValue = resolver.resolveValue(value, context);
        if (typeof resolvedValue === 'number')
            return resolvedValue;
        var num = Number(resolvedValue);
        return isNaN(num) ? defaultValue : defaultValue;
    };
    /**
     * Iterates over the provided range.  This includes adjusting the iteration rate to the range's direction.
     * @function
     * @param {number} startIndex - starting position for iteration
     * @param {number} endIndex - ending positon for iteration
     * @param {(index: number) => boolean | undefined} callback - Callback to be performed for each iterated value.  Aborts execution if this returns false.
     * @param {number} rate - amount to adjust iteration value on each pass
     */
    RepetitionDirective.prototype.forRange = function (startIndex, endIndex, callback, rate) {
        if (rate === void 0) { rate = 1; }
        var absRate = Math.abs(rate);
        var validRate = absRate > 0 ? absRate : 1;
        if (startIndex <= endIndex) {
            for (var index = startIndex; index <= endIndex; index += validRate) {
                var result = callback(index);
                if (result === false)
                    break;
            }
        }
        else {
            for (var index = startIndex; index >= endIndex; index -= validRate) {
                var result = callback(index);
                if (result === false)
                    break;
            }
        }
    };
    return RepetitionDirective;
}(LoopingDirective));
exports.RepetitionDirective = RepetitionDirective;
/**
 * This directive tries to assign a value to a particular path within the current context's local variables.
 * @class
 * @implements {KeyedTemplateDirective<SetLocalValueParams>}
 */
var SetLocalValueDirective = /** @class */ (function () {
    function SetLocalValueDirective() {
        this._getter = new lookup_1.GetNestedValueDirective();
    }
    SetLocalValueDirective.prototype.processParams = function (params, context, resolver) {
        return {
            path: resolver.getArray(params.path, context),
            value: params.value
        };
    };
    SetLocalValueDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        if (spec.path.length > 0) {
            var parentPath = spec.path.slice();
            parentPath.unshift(resolver.localVariablesKey);
            var finalStep = parentPath.pop();
            var target = this._getter.resolveUntypedPath(context, parentPath, context, resolver);
            if (typeof target === 'object' || target != null) {
                var resolvedStep = resolver.resolveValue(finalStep, context);
                var validStep = this._getter.getValidStepFrom(resolvedStep);
                if (validStep != null) {
                    var resolvedValue = resolver.resolveValue(spec.value, context);
                    this.setObjectProperty(target, validStep, resolvedValue);
                }
            }
        }
    };
    /**
     * Attaches the provided value to a property of the target object.
     * @function
     * @param {AnyObject} target - object value should be attached to
     * @param {PropertyLookupStep} step - indicates how the value should be assigned
     * @param {unknown} value - value to be assigned
     */
    SetLocalValueDirective.prototype.setObjectProperty = function (target, step, value) {
        if (Array.isArray(target)) {
            this.setArrayItem(target, step, value);
        }
        else if (typeof step === 'object') {
            this._getter.resolvePropertyCall(target, step);
        }
        else {
            target[step] = value;
        }
    };
    /**
     * Inserts the provided value into the target array.
     * @function
     * @param {AnyObject} target - array value should be inserted into
     * @param {PropertyLookupStep} step - indicates how the value should be inserted
     * @param {unknown} value - value to be inserted
     */
    SetLocalValueDirective.prototype.setArrayItem = function (target, step, value) {
        if (typeof step === 'object') {
            var callback = target[step.name];
            if (typeof callback === 'function') {
                var args = (step.args != null) ? step.args : [];
                callback.apply(target, args);
                return;
            }
        }
        var index = Number(step);
        target[index] = value;
    };
    return SetLocalValueDirective;
}());
exports.SetLocalValueDirective = SetLocalValueDirective;
