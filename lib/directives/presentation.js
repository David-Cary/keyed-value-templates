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
        var resolvedData = resolver.resolveObject(params.data, context);
        return {
            data: (typeof params.data === 'object' &&
                params.data != null &&
                !Array.isArray(params.data))
                ? resolvedData
                : {},
            template: resolver.resolveValue(params.template, context)
        };
    };
    DataViewDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        var localContext = resolver.createLocalContext(context);
        for (var key in spec.data) {
            resolver.setLocalValue(localContext, key, spec.data[key]);
        }
        var result = resolver.resolveValue(spec.template, localContext);
        return result;
    };
    return DataViewDirective;
}());
exports.DataViewDirective = DataViewDirective;
