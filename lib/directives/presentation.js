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
        var state = resolver.getResolutionState(context);
        var resolvedData = resolver.processParameter(params, 'data', function (value) { return resolver.resolveValue(value, context); }, state);
        var preprocess = params.preprocess != null
            ? resolver.processParameter(params, 'preprocess', function (value) { return resolver.resolveTypedValue(value, context, Boolean); }, state)
            : true;
        var templateProperty = 'template' in params ? 'template' : 'via';
        return {
            data: (typeof resolvedData === 'object' &&
                resolvedData != null &&
                !Array.isArray(resolvedData))
                ? resolvedData
                : {},
            template: preprocess
                ? resolver.processParameter(params, templateProperty, function (value) { return resolver.resolveValue(value, context); }, state)
                : params[templateProperty],
            templateKey: resolver.processParameter(params, 'templateKey', function (value) { return resolver.resolveTypedValue(value, context, function (value) { return value != null ? String(value) : undefined; }); }, state)
        };
    };
    DataViewDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        if (!this.validateTemplate(spec.template, context, resolver))
            return null;
        var localContext = resolver.createLocalContext(context);
        for (var key in spec.data) {
            resolver.setLocalValue(localContext, key, spec.data[key]);
        }
        if (spec.templateKey != null) {
            resolver.setLocalValue(localContext, spec.templateKey, spec.template);
        }
        var state = resolver.getResolutionState(context);
        if (state != null)
            state.property = undefined;
        var result = resolver.resolveValue(spec.template, localContext);
        return result;
    };
    DataViewDirective.prototype.validateTemplate = function (template, context, resolver) {
        // Safeguard against a context being set to the template as that can cause infinite looping.
        if (typeof template === 'object' &&
            template != null &&
            resolver.resolutionStateKey in template)
            return false;
        return true;
    };
    return DataViewDirective;
}());
exports.DataViewDirective = DataViewDirective;
