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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLocalVariableDirective = exports.GetNestedValueDirective = void 0;
/**
 * This directive tries to find a nested value within an object given the value's path.
 * @class
 * @implements {KeyedTemplateDirective<GetNestedValueParams>}
 */
var GetNestedValueDirective = /** @class */ (function () {
    function GetNestedValueDirective() {
    }
    GetNestedValueDirective.prototype.processParams = function (params, context, resolver) {
        return {
            source: resolver.resolveValue(params.source, context),
            path: resolver.getArray(params.path, context),
            default: params.default
        };
    };
    GetNestedValueDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        var value = this.resolveUntypedPath(spec.source, spec.path, context, resolver);
        if (value === undefined && spec.default !== undefined) {
            return resolver.resolveValue(spec.default, context);
        }
        return resolver.createDeepCopy(value);
    };
    /**
     * Steps through a provided path for a given object to try retrieving a particular value.
     * @function
     * @param {unknown} source - expected container for the target value
     * @param {unknown[]} path - steps to reach the target value
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @param {KeyedTemplateResolver} resolver - template resolver to be used
     * @returns {unknown} retrieved value, if any
     */
    GetNestedValueDirective.prototype.resolveUntypedPath = function (source, path, context, resolver) {
        var target = source !== null && source !== void 0 ? source : context;
        for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
            var step = path_1[_i];
            var targetType = typeof target;
            if ((targetType === 'object' && target != null) ||
                targetType === 'function') {
                var parent_1 = target;
                var resolvedStep = resolver.resolveValue(step, context);
                var validStep = this.getValidStepFrom(resolvedStep);
                if (validStep == null)
                    return undefined;
                target = this.resolveStep(parent_1, validStep);
            }
            else
                return undefined;
        }
        return target;
    };
    /**
     * Tries to convert an unknown value into something we can use as a path step.
     * @function
     * @param {unknown} source - value to be converted
     * @returns {unknown} converted step value if conversion is successful
     */
    GetNestedValueDirective.prototype.getValidStepFrom = function (source) {
        switch (typeof source) {
            case 'string':
            case 'number': {
                return source;
            }
            case 'object': {
                if (source !== null &&
                    'name' in source &&
                    typeof source.name === 'string') {
                    return source;
                }
                break;
            }
        }
    };
    /**
     * Tries to get the specified property value from the target object or function.
     * @function
     * @param {PropertyOwner} source - ower of the target property
     * @param {PropertyLookupStep} step - defines how the value should be retrieved
     * @returns {unknown} retrieved value, if any
     */
    GetNestedValueDirective.prototype.resolveStep = function (source, step) {
        if (Array.isArray(source)) {
            return this.resolveArrayLookUp(source, step);
        }
        if (typeof step === 'object') {
            return this.resolvePropertyCall(source, step);
        }
        return source[step];
    };
    /**
     * Tries to get the specified property value from an array.
     * @function
     * @param {PropertyOwner} source - ower of the target property
     * @param {PropertyLookupStep} step - defines how the value should be retrieved
     * @returns {unknown} retrieved value, if any
     */
    GetNestedValueDirective.prototype.resolveArrayLookUp = function (source, step) {
        switch (typeof step) {
            case 'object': {
                var callback = source[step.name];
                if (typeof callback === 'function') {
                    var copy = source.slice();
                    var args = (step.args != null) ? step.args : [];
                    return callback.apply(copy, args);
                }
                return undefined;
            }
            case 'string': {
                return source[step];
            }
        }
        var index = Number(step);
        return source[index];
    };
    /**
     * Tries to execute the named function and return the results.
     * @function
     * @param {PropertyOwner} source - ower of the target function
     * @param {PropertyCallRequest} request - propery name of target function and arguments to be used
     * @returns {unknown} return value of the function if found
     */
    GetNestedValueDirective.prototype.resolvePropertyCall = function (source, request) {
        var callback = source[request.name];
        if (typeof callback === 'function' && callback != null) {
            var args = (request.args != null) ? request.args : [];
            return callback.apply(source, args);
        }
    };
    GetNestedValueDirective.prototype.optimizeTemplate = function (params, resolver) {
        return {
            executable: false,
            value: __assign({}, params)
        };
    };
    return GetNestedValueDirective;
}());
exports.GetNestedValueDirective = GetNestedValueDirective;
/**
 * Tries to get a value from the local variables of the current context.
 * This functions much like other get nested value directives, but prepends the local variables key and returns the retrieved value directly.
 * This should make it both more compact and faster than a general lookup due to not needing a copy operation.
 * @class
 * @implements {GetNestedValueDirective}
 */
var GetLocalVariableDirective = /** @class */ (function (_super) {
    __extends(GetLocalVariableDirective, _super);
    function GetLocalVariableDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GetLocalVariableDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        var fullPath = spec.path.slice();
        fullPath.unshift(resolver.localVariablesKey);
        var value = this.resolveUntypedPath(spec.source, fullPath, context, resolver);
        return value;
    };
    return GetLocalVariableDirective;
}(GetNestedValueDirective));
exports.GetLocalVariableDirective = GetLocalVariableDirective;
