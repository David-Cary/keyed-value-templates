"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveValueDirective = exports.LiteralValueDirective = exports.TypeConversionDirective = exports.DEFAULT_UNKNOWN_TO_TYPE_CONVERSIONS = exports.CallbackDirective = void 0;
/**
 * This directive tries to convert the provided value to a function.
 * This is especially useful if triggering an object function that uses a callback.
 * @class
 * @implements {KeyedTemplateDirective<ValueWrapper>}
 */
var CallbackDirective = /** @class */ (function () {
    function CallbackDirective() {
    }
    CallbackDirective.prototype.processParams = function (params, context, resolver) {
        return {
            value: params.value
        };
    };
    CallbackDirective.prototype.execute = function (params, context, resolver) {
        return this.castToFunction(params.value, context, resolver);
    };
    /**
     * Converts the provided value to a function.
     * If a context and resolver are provided, this resolves the value as a template.
     * This resolution uses a local context with '$args' as a local variable, allowing access to the invoked arguments.
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap | undefined} context - extra data to be made available for resolution
     * @param {KeyedTemplateResolver | undefined} resolver - template resolver to be used
     * @returns {() => unknown} provided value as a function
     */
    CallbackDirective.prototype.castToFunction = function (value, context, resolver) {
        if (context != null && resolver != null) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var localContext = resolver.createLocalContext(context);
                localContext.$args = args;
                return resolver.resolveValue(value, localContext);
            };
        }
        return function () { return value; };
    };
    return CallbackDirective;
}());
exports.CallbackDirective = CallbackDirective;
/**
 * Provides a collection of conversion callbacks from an unknown value to particular types, keyed by the name of each of those types.
 * @constant {Record<string, TypeConversionCallback>}
 */
exports.DEFAULT_UNKNOWN_TO_TYPE_CONVERSIONS = {
    string: function (value) { return String(value); },
    number: function (value) { return Number(value); },
    boolean: function (value) { return Boolean(value); },
    bigint: function (value) {
        if (typeof value === 'number') {
            return BigInt(value);
        }
        return BigInt(Number(value));
    },
    symbol: function (value) {
        switch (typeof value) {
            case 'string': {
                return Symbol(value);
            }
            case 'number': {
                return Symbol(value);
            }
            case 'undefined': {
                return Symbol(undefined);
            }
        }
        return Symbol(String(value));
    },
    object: function (value) {
        if (typeof value === 'string') {
            try {
                var parsed = JSON.parse(value);
                if (typeof parsed === 'object' && parsed != null) {
                    return parsed;
                }
            }
            catch (error) { }
        }
        return {
            value: value
        };
    },
    array: function (value) {
        if (typeof value === 'string') {
            try {
                var parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
            catch (error) {
                return [value];
            }
        }
        return Array.isArray(value) ? value : [value];
    },
    null: function (value) { return null; },
    undefined: function (value) { return undefined; }
};
/**
 * This directive tries converting the provided value to the specified type.
 * @class
 * @implements {KeyedTemplateDirective<TypeConversionParams>}
 * @property {Record<string, TypeConversionCallback>} callbacks - map of conversion functions to use, keyed by type name
 */
var TypeConversionDirective = /** @class */ (function () {
    function TypeConversionDirective(callbacks) {
        this._functionCaster = new CallbackDirective();
        this.callbacks = Object.assign({}, exports.DEFAULT_UNKNOWN_TO_TYPE_CONVERSIONS, callbacks);
    }
    TypeConversionDirective.prototype.processParams = function (params, context, resolver) {
        return {
            value: resolver.resolveValue(params.value, context),
            as: resolver.getTypedArray(params.as, context, String)
        };
    };
    TypeConversionDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        return this.castValueAs(spec.value, spec.as, context, resolver);
    };
    /**
     * Converts the target value to one of the provided types.
     * If the value is one of the provided types, no conversion takes place.  Otherwise, the first type listed is used.
     * Note that this falls back on using a CallbackDirective for functions if no specific handler for that type is provided.
     * Said CallbackDirective will use the provided context and resolver to generate the resulting function.
     * @function
     * @param {unknown} value - value to be converted
     * @param {string[]} types - names of acceptable types
     * @param {KeyValueMap | undefined} context - extra data to be made available for resolution
     * @param {KeyedTemplateResolver | undefined} resolver - template resolver to be used
     * @returns {unknown} converted value
     */
    TypeConversionDirective.prototype.castValueAs = function (value, types, context, resolver) {
        if (types.length > 0) {
            var valueType = this.getExpandedTypeOf(value);
            if (!types.includes(valueType)) {
                var targetType = types[0];
                var convertor = this.callbacks[targetType];
                if (typeof convertor === 'function') {
                    return convertor(value);
                }
                if (targetType === 'function') {
                    return this._functionCaster.castToFunction(value, context, resolver);
                }
            }
        }
        return value;
    };
    /**
     * Adds 'array' and 'null' to 'typeof' resolution.
     * @function
     * @param {unknown} value - value to be evaluated
     * @returns {string} name of the resolved type
     */
    TypeConversionDirective.prototype.getExpandedTypeOf = function (value) {
        if (Array.isArray(value))
            return 'array';
        if (value === null)
            return 'null';
        return typeof value;
    };
    return TypeConversionDirective;
}());
exports.TypeConversionDirective = TypeConversionDirective;
/**
 * This directive wraps the provided value, returning an exact copy of the target value without resolving it.
 * This lets you use this to wrap other directive and protect them from execution.
 * @class
 * @implements {KeyedTemplateDirective<ValueWrapper>}
 */
var LiteralValueDirective = /** @class */ (function () {
    function LiteralValueDirective() {
    }
    LiteralValueDirective.prototype.processParams = function (params, context, resolver) {
        return {
            value: params.value
        };
    };
    LiteralValueDirective.prototype.execute = function (params, context, resolver) {
        return resolver.createDeepCopy(params.value);
    };
    LiteralValueDirective.prototype.optimizeTemplate = function (params, resolver) {
        if (typeof params.value === 'object' && params.value != null) {
            return {
                executable: false,
                value: resolver.createDeepCopy(params)
            };
        }
        return {
            executable: true,
            value: params.value
        };
    };
    return LiteralValueDirective;
}());
exports.LiteralValueDirective = LiteralValueDirective;
/**
 * This directive performs 2 passes of resolution on the target value.
 * This lets it execute the value of a literal directive, circumventing their usual protection.
 * @class
 * @implements {KeyedTemplateDirective<ValueWrapper>}
 */
var ResolveValueDirective = /** @class */ (function () {
    function ResolveValueDirective() {
    }
    ResolveValueDirective.prototype.processParams = function (params, context, resolver) {
        return {
            value: resolver.resolveValue(params.value, context)
        };
    };
    ResolveValueDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        return resolver.resolveValue(spec.value, context);
    };
    return ResolveValueDirective;
}());
exports.ResolveValueDirective = ResolveValueDirective;
