"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionCallDirective = void 0;
/**
 * This directive executes the provided function with a given set of arguments and returns the results.
 * @class
 * @implements {KeyedTemplateDirective<FunctionCallParams>}
 */
var FunctionCallDirective = /** @class */ (function () {
    function FunctionCallDirective() {
    }
    FunctionCallDirective.prototype.processParams = function (params, context, resolver) {
        var state = resolver.getResolutionState(context);
        return {
            target: resolver.processParameter(params, 'target', function (value) { return resolver.resolveValue(value, context); }, state),
            args: resolver.processParameter(params, 'args', function (value) { return resolver.resolveAsArray(value, context); }, state)
        };
    };
    FunctionCallDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        if (typeof spec.target === 'function') {
            return spec.target.apply(null, spec.args);
        }
    };
    return FunctionCallDirective;
}());
exports.FunctionCallDirective = FunctionCallDirective;
