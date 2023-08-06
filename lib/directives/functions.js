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
        return {
            target: resolver.resolveValue(params.target, context),
            args: resolver.resolveAsArray(params.args, context)
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
