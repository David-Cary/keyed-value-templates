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
exports.ValueInRangeDirective = exports.GreaterThanOrEqualToDirective = exports.GreaterThanDirective = exports.LessThanOrEqualToDirective = exports.LessThanDirective = exports.StrictInequalityDirective = exports.InequalityDirective = exports.StrictEqualityDirective = exports.EqualityDirective = exports.SerialComparisonDirective = void 0;
/**
 * This directive iterates through an argument list, performing a given comparison on each adjacent pair of values until the comparison is false.
 * This makes it roughly equivalent to "compare(a, b) && compare(b, c)..".
 * In most cases you'll probably only use this with 2 arguments, but should you need it support for more is there.
 * @class
 * @implements {KeyedTemplateDirective<ArgumentsWrapper, boolean>}
 * @property {ComparisonCallback} callback - comparison to be performed on each pair
 */
var SerialComparisonDirective = /** @class */ (function () {
    function SerialComparisonDirective(callback) {
        this.callback = callback;
    }
    SerialComparisonDirective.prototype.processParams = function (params, context, resolver) {
        return {
            args: resolver.getArray(params.args, context)
        };
    };
    SerialComparisonDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        if (spec.args.length > 1) {
            var left = resolver.resolveValue(spec.args[0], context);
            for (var i = 1; i < spec.args.length; i++) {
                var right = resolver.resolveValue(spec.args[i], context);
                var result = this.callback(left, right);
                if (!result) {
                    return false;
                }
                left = right;
            }
            return true;
        }
        return false;
    };
    return SerialComparisonDirective;
}());
exports.SerialComparisonDirective = SerialComparisonDirective;
/**
 * Performs an equality comparison ("==") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
var EqualityDirective = /** @class */ (function (_super) {
    __extends(EqualityDirective, _super);
    function EqualityDirective() {
        /* eslint eqeqeq: 0 */
        var callback = function (a, b) { return a == b; };
        return _super.call(this, callback) || this;
    }
    return EqualityDirective;
}(SerialComparisonDirective));
exports.EqualityDirective = EqualityDirective;
/**
 * Performs a strict equality comparison ("===") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
var StrictEqualityDirective = /** @class */ (function (_super) {
    __extends(StrictEqualityDirective, _super);
    function StrictEqualityDirective() {
        var callback = function (a, b) { return a === b; };
        return _super.call(this, callback) || this;
    }
    return StrictEqualityDirective;
}(SerialComparisonDirective));
exports.StrictEqualityDirective = StrictEqualityDirective;
/**
 * Performs an inequality comparison ("!=") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
var InequalityDirective = /** @class */ (function (_super) {
    __extends(InequalityDirective, _super);
    function InequalityDirective() {
        var callback = function (a, b) { return a != b; };
        return _super.call(this, callback) || this;
    }
    return InequalityDirective;
}(SerialComparisonDirective));
exports.InequalityDirective = InequalityDirective;
/**
 * Performs a strict inequality comparison ("!==") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
var StrictInequalityDirective = /** @class */ (function (_super) {
    __extends(StrictInequalityDirective, _super);
    function StrictInequalityDirective() {
        var callback = function (a, b) { return a !== b; };
        return _super.call(this, callback) || this;
    }
    return StrictInequalityDirective;
}(SerialComparisonDirective));
exports.StrictInequalityDirective = StrictInequalityDirective;
/**
 * Performs a "less than" comparison ("<") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
var LessThanDirective = /** @class */ (function (_super) {
    __extends(LessThanDirective, _super);
    function LessThanDirective() {
        var callback = function (a, b) { return a < b; };
        return _super.call(this, callback) || this;
    }
    return LessThanDirective;
}(SerialComparisonDirective));
exports.LessThanDirective = LessThanDirective;
/**
 * Performs a "less than or equal to" comparison ("<=") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
var LessThanOrEqualToDirective = /** @class */ (function (_super) {
    __extends(LessThanOrEqualToDirective, _super);
    function LessThanOrEqualToDirective() {
        var callback = function (a, b) { return a <= b; };
        return _super.call(this, callback) || this;
    }
    return LessThanOrEqualToDirective;
}(SerialComparisonDirective));
exports.LessThanOrEqualToDirective = LessThanOrEqualToDirective;
/**
 * Performs a "greater than" comparison (">") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
var GreaterThanDirective = /** @class */ (function (_super) {
    __extends(GreaterThanDirective, _super);
    function GreaterThanDirective() {
        var callback = function (a, b) { return a > b; };
        return _super.call(this, callback) || this;
    }
    return GreaterThanDirective;
}(SerialComparisonDirective));
exports.GreaterThanDirective = GreaterThanDirective;
/**
 * Performs a "greater than or equal to" comparison (">=") on each value pair.
 * @class
 * @extends {SerialComparisonDirective}
 */
var GreaterThanOrEqualToDirective = /** @class */ (function (_super) {
    __extends(GreaterThanOrEqualToDirective, _super);
    function GreaterThanOrEqualToDirective() {
        var callback = function (a, b) { return a >= b; };
        return _super.call(this, callback) || this;
    }
    return GreaterThanOrEqualToDirective;
}(SerialComparisonDirective));
exports.GreaterThanOrEqualToDirective = GreaterThanOrEqualToDirective;
/**
 * This directive checks if a value falls between a given minimum and maximum.
 * This makes it functionality equivalent to "min <= value && value <= max".
 * @class
 * @implements {KeyedTemplateDirective<ValueInRangeParams, boolean>}
 */
var ValueInRangeDirective = /** @class */ (function () {
    function ValueInRangeDirective() {
    }
    ValueInRangeDirective.prototype.processParams = function (params, context, resolver) {
        return {
            min: resolver.resolveValue(params.min, context),
            max: resolver.resolveValue(params.max, context),
            value: resolver.resolveValue(params.value, context)
        };
    };
    ValueInRangeDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        return spec.min <= spec.value && spec.value <= spec.max;
    };
    return ValueInRangeDirective;
}());
exports.ValueInRangeDirective = ValueInRangeDirective;
