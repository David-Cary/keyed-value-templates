"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapValuesDirective = void 0;
/**
 * This directive creates a copy of the provided source object with optional transformations applied to the keys and strings.
 * @class
 * @implements {KeyedTemplateDirective<MapValuesParameters, any>}
 */
var MapValuesDirective = /** @class */ (function () {
    function MapValuesDirective() {
    }
    MapValuesDirective.prototype.processParams = function (params, context, resolver) {
        var state = resolver.getResolutionState(context);
        var resolvedSource = resolver.processParameter(params, 'source', function (value) { return resolver.resolveValue(value, context); }, state);
        return {
            source: (typeof resolvedSource === 'object' && resolvedSource != null)
                ? resolvedSource
                : undefined,
            getKey: params.getKey,
            getValue: params.getValue
        };
    };
    MapValuesDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        var localContext = resolver.createLocalContext(context);
        if (spec.source != null) {
            var state = {
                parent: resolver.getResolutionState(context),
                source: spec.source
            };
            localContext[resolver.resolutionStateKey] = state;
            if (Array.isArray(spec.source)) {
                var results_1 = [];
                for (state.index = 0; state.index < spec.source.length; state.index++) {
                    resolver.setLocalValue(localContext, '$index', state.index);
                    resolver.setLocalValue(localContext, '$value', spec.source[state.index]);
                    var position = state.index;
                    if (spec.getKey != null) {
                        position = Number(resolver.resolveValue(spec.getKey, localContext));
                        if (isNaN(position))
                            continue;
                    }
                    results_1[position] = spec.getValue != null
                        ? resolver.resolveValue(spec.getValue, localContext)
                        : spec.source[state.index];
                }
                return results_1;
            }
            var results = {};
            for (var key in spec.source) {
                state.property = key;
                resolver.setLocalValue(localContext, '$key', key);
                resolver.setLocalValue(localContext, '$value', spec.source[key]);
                var validKey = key;
                if (spec.getKey != null) {
                    var resolvedKey = resolver.resolveValue(spec.getKey, localContext);
                    if (resolvedKey == null || resolvedKey === '')
                        continue;
                    validKey = String(resolvedKey);
                }
                results[validKey] = spec.getValue != null
                    ? resolver.resolveValue(spec.getValue, localContext)
                    : spec.source[key];
            }
            return results;
        }
        return spec.source;
    };
    return MapValuesDirective;
}());
exports.MapValuesDirective = MapValuesDirective;
