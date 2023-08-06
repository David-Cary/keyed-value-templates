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
exports.NegationOperatorDirective = exports.NullishCoalescingDirective = exports.OrOperatorDirective = exports.AndOperatorDirective = exports.RemainderDirective = exports.DivisionDirective = exports.ExponentiationDirective = exports.MultiplicationDirective = exports.SubtractionDirective = exports.AdditionDirective = exports.castToCommonKey = exports.TypedRepeatedOperationDirective = exports.RepeatedOperationDirective = void 0;
/**
 * This directive performs the target operation on all provided arguments, working from the first pair to the last argument.
 * This involves applying the operation to the first two argument, then repeating for the previous results and the next available argument.
 * @class
 * @implements {KeyedTemplateDirective<ArgumentsWrapper>}
 * @property {RepeatableOperationDirectiveCallback} callback - operation to be applied to each pairing
 * @property {(value: unknown) => boolean} checkExitSignal - optional callback that should return true if we should stop iterating through the arguments when a certain value is found

 */
var RepeatedOperationDirective = /** @class */ (function () {
    function RepeatedOperationDirective(callback, checkExitSignal) {
        this.callback = callback;
        this.checkExitSignal = checkExitSignal;
    }
    RepeatedOperationDirective.prototype.processParams = function (params, context, resolver) {
        return {
            args: resolver.getArray(params.args, context)
        };
    };
    RepeatedOperationDirective.prototype.execute = function (params, context, resolver) {
        var _a;
        var spec = this.processParams(params, context, resolver);
        if (spec.args.length > 0) {
            var left = resolver.resolveValue(spec.args[0], context);
            for (var i = 1; i < spec.args.length; i++) {
                if (((_a = this.checkExitSignal) === null || _a === void 0 ? void 0 : _a.call(this, left)) === true) {
                    break;
                }
                var right = resolver.resolveValue(spec.args[i], context);
                left = this.callback(left, right);
            }
            return left;
        }
    };
    return RepeatedOperationDirective;
}());
exports.RepeatedOperationDirective = RepeatedOperationDirective;
/**
 * This works as a more general RepeatedOperationDirective, with the exception that it converts arguments to a particular type before performing the operation.
 * @class
 * @template T
 * @implements {KeyedTemplateDirective<ArgumentsWrapper>}
 * @property {(value: unknown) => T} convertor - callback to convert arguments to the target type
 * @property {RepeatableOperationDirectiveCallback} callback - operation to be applied to each pairing
 * @property {(value: unknown) => boolean} checkExitSignal - optional callback that should return true if we should stop iterating through the arguments when a certain value is found
 */
var TypedRepeatedOperationDirective = /** @class */ (function () {
    function TypedRepeatedOperationDirective(convertor, callback, checkExitSignal) {
        this.convertor = convertor;
        this.callback = callback;
        this.checkExitSignal = checkExitSignal;
    }
    TypedRepeatedOperationDirective.prototype.processParams = function (params, context, resolver) {
        return {
            args: resolver.getArray(params.args, context)
        };
    };
    TypedRepeatedOperationDirective.prototype.execute = function (params, context, resolver) {
        var _a;
        var spec = this.processParams(params, context, resolver);
        if (spec.args.length > 0) {
            var left = resolver.resolveTypedValue(spec.args[0], context, this.convertor);
            for (var i = 1; i < spec.args.length; i++) {
                if (((_a = this.checkExitSignal) === null || _a === void 0 ? void 0 : _a.call(this, left)) === true) {
                    break;
                }
                var right = resolver.resolveTypedValue(spec.args[i], context, this.convertor);
                left = this.callback(left, right);
            }
            return left;
        }
    };
    return TypedRepeatedOperationDirective;
}());
exports.TypedRepeatedOperationDirective = TypedRepeatedOperationDirective;
/**
 * Converts a value into either a string or number if it's not one already.
 * @function
 * @param {unknown} source - value to be converted
 * @returns {CommonKey} converted value
 */
function castToCommonKey(source) {
    switch (typeof source) {
        case 'string':
        case 'number': {
            return source;
        }
        default: {
            return String(source);
        }
    }
}
exports.castToCommonKey = castToCommonKey;
/**
 * Adds up all provided arguments.
 * @class
 * @implements {TypedRepeatedOperationDirective<CommonKey>}
 */
var AdditionDirective = /** @class */ (function (_super) {
    __extends(AdditionDirective, _super);
    function AdditionDirective() {
        var callback = function (a, b) {
            if (typeof a === 'string') {
                return typeof b === 'string' ? a + b : a + String(b);
            }
            return typeof b === 'string' ? String(a) + b : a + b;
        };
        return _super.call(this, castToCommonKey, callback) || this;
    }
    return AdditionDirective;
}(TypedRepeatedOperationDirective));
exports.AdditionDirective = AdditionDirective;
/**
 * Subtracts all following arguments from the first argument.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
var SubtractionDirective = /** @class */ (function (_super) {
    __extends(SubtractionDirective, _super);
    function SubtractionDirective() {
        var callback = function (a, b) { return a - b; };
        return _super.call(this, Number, callback) || this;
    }
    return SubtractionDirective;
}(TypedRepeatedOperationDirective));
exports.SubtractionDirective = SubtractionDirective;
/**
 * Multiplies all provided arguments.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
var MultiplicationDirective = /** @class */ (function (_super) {
    __extends(MultiplicationDirective, _super);
    function MultiplicationDirective() {
        var callback = function (a, b) { return a * b; };
        return _super.call(this, Number, callback) || this;
    }
    return MultiplicationDirective;
}(TypedRepeatedOperationDirective));
exports.MultiplicationDirective = MultiplicationDirective;
/**
 * Raises the previous argument to the power of the next argument.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
var ExponentiationDirective = /** @class */ (function (_super) {
    __extends(ExponentiationDirective, _super);
    function ExponentiationDirective() {
        var callback = function (a, b) { return Math.pow(a, b); };
        return _super.call(this, Number, callback) || this;
    }
    return ExponentiationDirective;
}(TypedRepeatedOperationDirective));
exports.ExponentiationDirective = ExponentiationDirective;
/**
 * Divides the first argument by all following arguments.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
var DivisionDirective = /** @class */ (function (_super) {
    __extends(DivisionDirective, _super);
    function DivisionDirective() {
        var callback = function (a, b) { return a / b; };
        return _super.call(this, Number, callback) || this;
    }
    return DivisionDirective;
}(TypedRepeatedOperationDirective));
exports.DivisionDirective = DivisionDirective;
/**
 * Get the remainder of the first argument when divided by all following arguments.
 * @class
 * @implements {TypedRepeatedOperationDirective<number>}
 */
var RemainderDirective = /** @class */ (function (_super) {
    __extends(RemainderDirective, _super);
    function RemainderDirective() {
        var callback = function (a, b) { return a % b; };
        return _super.call(this, Number, callback) || this;
    }
    return RemainderDirective;
}(TypedRepeatedOperationDirective));
exports.RemainderDirective = RemainderDirective;
/**
 * Returns true if and only if all arguments are true.
 * @class
 * @implements {TypedRepeatedOperationDirective<boolean>}
 */
var AndOperatorDirective = /** @class */ (function (_super) {
    __extends(AndOperatorDirective, _super);
    function AndOperatorDirective() {
        var callback = function (a, b) { return a && b; };
        var checkExitSignal = function (value) { return !value; };
        return _super.call(this, Boolean, callback, checkExitSignal) || this;
    }
    return AndOperatorDirective;
}(TypedRepeatedOperationDirective));
exports.AndOperatorDirective = AndOperatorDirective;
/**
 * Returns true if any of the arguments are true.
 * @class
 * @implements {TypedRepeatedOperationDirective<boolean>}
 */
var OrOperatorDirective = /** @class */ (function (_super) {
    __extends(OrOperatorDirective, _super);
    function OrOperatorDirective() {
        var callback = function (a, b) { return a || b; };
        var checkExitSignal = function (value) { return value; };
        return _super.call(this, Boolean, callback, checkExitSignal) || this;
    }
    return OrOperatorDirective;
}(TypedRepeatedOperationDirective));
exports.OrOperatorDirective = OrOperatorDirective;
/**
 * Returns the first non-null argument found.
 * @class
 * @implements {RepeatedOperationDirective}
 */
var NullishCoalescingDirective = /** @class */ (function (_super) {
    __extends(NullishCoalescingDirective, _super);
    function NullishCoalescingDirective() {
        var callback = function (a, b) { return a !== null && a !== void 0 ? a : b; };
        var checkExitSignal = function (value) { return value != null; };
        return _super.call(this, callback, checkExitSignal) || this;
    }
    return NullishCoalescingDirective;
}(RepeatedOperationDirective));
exports.NullishCoalescingDirective = NullishCoalescingDirective;
/**
 * Negates the boolean equivalent of a given value.
 * @class
 * @implements {KeyedTemplateDirective<ValueWrapper, boolean>}
 */
var NegationOperatorDirective = /** @class */ (function () {
    function NegationOperatorDirective() {
    }
    NegationOperatorDirective.prototype.processParams = function (params, context, resolver) {
        return {
            value: params.value
        };
    };
    NegationOperatorDirective.prototype.execute = function (params, context, resolver) {
        var resolvedValue = resolver.resolveValue(params.value, context);
        var castValue = Boolean(resolvedValue);
        return !castValue;
    };
    return NegationOperatorDirective;
}());
exports.NegationOperatorDirective = NegationOperatorDirective;
