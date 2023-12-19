"use strict";
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
exports.KeyedTemplateResolver = void 0;
/**
 * These resolvers provide a suite of utility functions for converting keyed template objects to their intended values for a particular context.
 * In this case, a keyed template is an object with a specified property that not only indicates the object should be processes, but also what process should be used to convert it.
 * @class
 * @property {Record<string, KeyedTemplateDirective>} directives - map of directives to use for a particular key.
 * @property {string} directivesKey - property to be treated as an object template marker (defaults to '$use')
 * @property {string} localVariablesKey - property to be attach to a local context for storing local variables (defaults to '$vars')
 */
var KeyedTemplateResolver = /** @class */ (function () {
    function KeyedTemplateResolver(directives, directivesKey, localVariablesKey) {
        if (directives === void 0) { directives = {}; }
        if (directivesKey === void 0) { directivesKey = '$use'; }
        if (localVariablesKey === void 0) { localVariablesKey = '$vars'; }
        this.directives = directives;
        this.directivesKey = directivesKey;
        this.localVariablesKey = localVariablesKey;
    }
    /**
     * Resolves all template objects in the provided value.
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {unknown} version of the value with templates resolved
     */
    KeyedTemplateResolver.prototype.resolveValue = function (value, context) {
        if (context === void 0) { context = {}; }
        if (typeof value === 'object' && value != null) {
            if (Array.isArray(value)) {
                return this.resolveValues(value, context);
            }
            return this.resolveObject(value, context);
        }
        return value;
    };
    /**
     * Resolves the target as a template and converts the results to a particular type.
     * @template T
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @param {TypeConversionCallback<unknown, T>} convertor - callback used to convert the results
     * @returns {T} converted and resolved version of the provided value
     */
    KeyedTemplateResolver.prototype.resolveTypedValue = function (value, context, convertor) {
        var rawValue = this.resolveValue(value, context);
        return convertor(rawValue);
    };
    /**
     * Resolves all template objects in a given array.
     * @function
     * @param {unknown} value - array to be processed
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {unknown[]} array of converted objects
     */
    KeyedTemplateResolver.prototype.resolveValues = function (value, context) {
        var _this = this;
        if (context === void 0) { context = {}; }
        return value.map(function (item) { return _this.resolveValue(item, context); });
    };
    /**
     * Resolves the items in an array and converts them to a particular type.
     * @template T
     * @function
     * @param {unknown} value - array to be processed
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @param {TypeConversionCallback<unknown, T>} convertor - callback used to convert the results
     * @returns {T[]} converted and resolved version of the provided array's contents
     */
    KeyedTemplateResolver.prototype.resolveTypedValues = function (value, context, convertor) {
        var _this = this;
        return value.map(function (item) { return _this.resolveTypedValue(item, context, convertor); });
    };
    /**
     * Tries to resolve an object as a possible template, then tries to resolve the object's property values.
     * @function
     * @param {unknown} value - object to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {unknown} version of the object with templates resolved
     */
    KeyedTemplateResolver.prototype.resolveObject = function (value, context) {
        if (context === void 0) { context = {}; }
        var directive = this.getObjectDirective(value);
        if (directive != null) {
            var resolvedValue = directive.execute(value, context, this);
            return resolvedValue;
        }
        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                return this.resolveValues(value, context);
            }
            if (value != null) {
                var valueMap = value;
                var copy = {};
                for (var key in valueMap) {
                    copy[key] = this.resolveValue(valueMap[key], context);
                }
                return copy;
            }
        }
        return value;
    };
    /**
     * Tries to resolve an object as a possible template, but leaves any resulting property values alone.
     * @function
     * @param {unknown} value - object to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {unknown} results of processing the object as a template
     */
    KeyedTemplateResolver.prototype.executeObjectDirective = function (value, context) {
        if (context === void 0) { context = {}; }
        var directive = this.getObjectDirective(value);
        if (directive != null) {
            var resolvedValue = directive.execute(value, context, this);
            return resolvedValue;
        }
        return value;
    };
    /**
     * Retrieves the directive that would be used if the target object were treated as a template.
     * @function
     * @param {unknown} value - object to be evaluated
     * @returns {KeyedTemplateDirective | undefined} directive to be used, if any
     */
    KeyedTemplateResolver.prototype.getObjectDirective = function (value) {
        if (this.directivesKey in value) {
            var directiveId = value[this.directivesKey];
            if (typeof directiveId === 'string') {
                return this.directives[directiveId];
            }
        }
    };
    /**
     * Retrieves the key for the directive that would be used if the target value were treated as a template.
     * @function
     * @param {unknown} value - value to be evaluated
     * @returns {string | undefined} key for the appropriate directive, if any
     */
    KeyedTemplateResolver.prototype.getDirectiveIdFor = function (value) {
        if (typeof value === 'object' &&
            value != null &&
            this.directivesKey in value) {
            var valueMap = value;
            var directiveId = valueMap[this.directivesKey];
            if (typeof directiveId === 'string') {
                return directiveId;
            }
        }
    };
    /**
     * Tries to resolve a value as a possible template.  If the result is an object, the properties do not in turn get resolved.
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {unknown} results of processing the value as a template
     */
    KeyedTemplateResolver.prototype.executeDirectiveFor = function (value, context) {
        if (context === void 0) { context = {}; }
        if (typeof value === 'object' && value != null && !Array.isArray(value)) {
            return this.executeObjectDirective(value, context);
        }
        return value;
    };
    /**
     * Casts the results of template resolution to an array.
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {unknown[]} the resolved value either as an array or wrapped in an array
     */
    KeyedTemplateResolver.prototype.getArray = function (value, context) {
        if (context === void 0) { context = {}; }
        var resolved = this.executeDirectiveFor(value, context);
        if (Array.isArray(resolved))
            return resolved;
        return resolved === undefined ? [] : [resolved];
    };
    /**
     * Casts the results of template resolution to a typed array.
     * @template T
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @param {TypeConversionCallback<unknown, T>} convertor - callback used to convert each item
     * @returns {T[]} the resolved value either as a typed array or wrapped in such an array
     */
    KeyedTemplateResolver.prototype.getTypedArray = function (value, context, convertor) {
        var items = this.getArray(value, context);
        return this.resolveTypedValues(items, context, convertor);
    };
    /**
     * Resolved all contents of the target as templates and packages the results in an array.
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {unknown[]} array of all resolved values
     */
    KeyedTemplateResolver.prototype.resolveAsArray = function (value, context) {
        if (context === void 0) { context = {}; }
        var items = this.getArray(value, context);
        return this.resolveValues(items, context);
    };
    /**
     * Resolves the target as a template and converts the results to a key value map.
     * For strings, this wraps them in an object where the key and value are the same.
     * Any results that can't be treated that way wrap the results as the object's 'value' property.
     * @function
     * @param {unknown} value - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @returns {KeyValueMap} resolved value as a key value map
     */
    KeyedTemplateResolver.prototype.getValueMap = function (value, context) {
        var _a;
        if (context === void 0) { context = {}; }
        var resolved = this.executeDirectiveFor(value, context);
        if (typeof resolved === 'object' && resolved != null) {
            return resolved;
        }
        if (typeof resolved === 'string') {
            return _a = {},
                _a[resolved] = resolved,
                _a;
        }
        return {
            value: resolved
        };
    };
    /**
     * Produces a deep copy of the target value, ignoring all directive markers.
     * This means all objects in the copy are themselves copies, meaning they can altered without affecting the original.
     * Note that this does not currently apply to functions.  For those only the referennce is copied, so copy will continue to use functions of the original.
     * @function
     * @param {unknown} source - value to be copied
     * @returns {unknown} deep copy of the source
     */
    KeyedTemplateResolver.prototype.createDeepCopy = function (source, copyMap) {
        if (copyMap === void 0) { copyMap = new Map(); }
        if (typeof source === 'object' && source != null) {
            if (copyMap.has(source)) {
                return copyMap.get(source);
            }
            if (Array.isArray(source)) {
                var result_1 = source.slice();
                copyMap.set(source, result_1);
                for (var i = 0; i < result_1.length; i++) {
                    result_1[i] = this.createDeepCopy(result_1[i], copyMap);
                }
                return result_1;
            }
            var valueMap = source;
            var result = {};
            copyMap.set(source, result);
            for (var key in valueMap) {
                result[key] = this.createDeepCopy(valueMap[key], copyMap);
            }
            return result;
        }
        return source;
    };
    /**
     * Retrieves a version of the template with context independent members already processed.
     * This should result in faster processing when the context is applied as some values are precalculated.
     * @function
     * @param {unknown} template - value to preprocessed
     * @returns {TemplateOptimizationResult} optimized version of the provided template and whether the results can themselves be used in further optimization
     */
    KeyedTemplateResolver.prototype.optimizeTemplate = function (template) {
        var _this = this;
        var result = {
            executable: true,
            value: template
        };
        if (typeof template === 'object' && template != null) {
            if (Array.isArray(template)) {
                result.value = template.map(function (item) {
                    var subresult = _this.optimizeTemplate(item);
                    if (!subresult.executable) {
                        result.executable = false;
                    }
                    return subresult.value;
                });
            }
            else {
                var valueMap = template;
                var directive = this.getObjectDirective(valueMap);
                if ((directive === null || directive === void 0 ? void 0 : directive.optimizeTemplate) != null) {
                    return directive.optimizeTemplate(valueMap, this);
                }
                var optimizedParams = {};
                for (var key in valueMap) {
                    var subresult = this.optimizeTemplate(valueMap[key]);
                    optimizedParams[key] = subresult.value;
                    if (!subresult.executable) {
                        result.executable = false;
                    }
                }
                result.value = (directive != null && result.executable)
                    ? directive.execute(optimizedParams, {}, this)
                    : optimizedParams;
            }
        }
        return result;
    };
    /**
     * Creates a copy of the target context with an overwritten area for storing local variables.
     * Note that if such a property already exists a shallow copy of that will be used in the context copy.
     * That means you can replace variables in a nested local context without changing what's assigned to that variable in the parent context.
     * In effect this provides limited support for scoped variables.
     * @function
     * @param {KeyValueMap} context - values to be copied
     * @returns {KeyValueMap} copy of the provided context with a local variables property
     */
    KeyedTemplateResolver.prototype.createLocalContext = function (context) {
        var localContext = __assign({}, context);
        if (this.localVariablesKey != null) {
            var previousVars = context[this.localVariablesKey];
            localContext[this.localVariablesKey] = (previousVars != null)
                ? __assign({}, previousVars) : {};
        }
        return localContext;
    };
    /**
     * Tries to retrieve a value from within the local variables property of a given context object.
     * @function
     * @param {KeyValueMap} context - object the value should be inserted into
     * @param {string} key - key for the property to be retrieved
     * @returns {unknown} value found, if any
     */
    KeyedTemplateResolver.prototype.getLocalValue = function (context, key) {
        if (this.localVariablesKey in context) {
            var variables = context[this.localVariablesKey];
            if (typeof variables === 'object' && variables != null) {
                return variables[key];
            }
        }
    };
    /**
     * Tries to set a value within the local variables property of a given context object.
     * @function
     * @param {KeyValueMap} context - object the value should be inserted into
     * @param {string} key - key for the property to be set
     * @param {unknown} value - value to be stored
     */
    KeyedTemplateResolver.prototype.setLocalValue = function (context, key, value) {
        if (this.localVariablesKey in context) {
            var destination = context[this.localVariablesKey];
            if (typeof destination === 'object' && destination != null) {
                destination[key] = value;
            }
        }
    };
    return KeyedTemplateResolver;
}());
exports.KeyedTemplateResolver = KeyedTemplateResolver;
