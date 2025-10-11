"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataViewDirective = void 0;
/**
 * This directive resolves the provided template using the specified local variables.
 * @class
 * @implements {KeyedTemplateDirective<DataViewParameters>}
 */
var DataViewDirective = /** @class */ (function () {
    function DataViewDirective() {
    }
    DataViewDirective.prototype.processParams = function (params, context, resolver) {
        var _a;
        var resolvedData = resolver.resolveValue(params.data, context);
        return {
            data: (typeof resolvedData === 'object' &&
                resolvedData != null &&
                !Array.isArray(resolvedData))
                ? resolvedData
                : {},
            template: resolver.resolveValue((_a = params.template) !== null && _a !== void 0 ? _a : params.via, context),
            templateKey: resolver.resolveTypedValue(params.templateKey, context, function (value) { return value != null ? String(value) : undefined; })
        };
    };
    DataViewDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        var localContext = resolver.createLocalContext(context);
        for (var key in spec.data) {
            resolver.setLocalValue(localContext, key, spec.data[key]);
        }
        if (spec.templateKey != null) {
            resolver.setLocalValue(localContext, spec.templateKey, spec.template);
        }
        var result = resolver.resolveValue(spec.template, localContext);
        return result;
    };
    return DataViewDirective;
}());
exports.DataViewDirective = DataViewDirective;
