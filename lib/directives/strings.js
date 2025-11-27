"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseStringDirective = void 0;
/**
 * This directive processes string values, potentially converting them to another type of value.
 * @class
 * @implements {KeyedTemplateDirective<TextWrapper>}
 * @property {ParseStringCallback} parseString - callback for converting strings
 */
var ParseStringDirective = /** @class */ (function () {
    function ParseStringDirective(parseString, optimizeTemplate) {
        this.parseString = parseString;
        this.optimizeTemplate = optimizeTemplate;
    }
    ParseStringDirective.prototype.processParams = function (params, context, resolver) {
        var state = resolver.getResolutionState(context);
        return {
            text: resolver.processParameter(params, 'text', function (value) { return resolver.resolveTypedValue(value, context, String); }, state)
        };
    };
    ParseStringDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        return this.parseString(spec.text, context);
    };
    return ParseStringDirective;
}());
exports.ParseStringDirective = ParseStringDirective;
