"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfThenDirective = void 0;
/**
 * This directive evaluates an expression and return 1 of 2 values depending on whether the expression is true or false.
 * @class
 * @implements {KeyedTemplateDirective<IfThenFork>}
 */
var IfThenDirective = /** @class */ (function () {
    function IfThenDirective() {
    }
    IfThenDirective.prototype.processParams = function (params, context, resolver) {
        var state = resolver.getResolutionState(context);
        return {
            if: resolver.processParameter(params, 'if', function (value) { return resolver.resolveTypedValue(value, context, Boolean); }, state),
            then: params.then,
            else: params.else
        };
    };
    IfThenDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        var state = resolver.getResolutionState(context);
        if (state != null) {
            state.property = spec.if ? 'then' : 'else';
        }
        return spec.if
            ? resolver.resolveValue(spec.then, context)
            : resolver.resolveValue(spec.else, context);
    };
    return IfThenDirective;
}());
exports.IfThenDirective = IfThenDirective;
