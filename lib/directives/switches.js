"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchDirective = void 0;
var scripting_1 = require("./scripting");
/**
 * This directive mimics the behavior of a javascript switch statement.
 * @class
 * @implements {KeyedTemplateDirective<SwitchDirectiveFork>}
 */
var SwitchDirective = /** @class */ (function () {
    function SwitchDirective(exitIds) {
        if (exitIds === void 0) { exitIds = []; }
        this._stepHandler = new scripting_1.MultiStepDirective(exitIds);
    }
    SwitchDirective.prototype.processParams = function (params, context, resolver) {
        return {
            value: resolver.resolveValue(params.value, context),
            cases: resolver.getArray(params.cases, context)
        };
    };
    SwitchDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        var localContext = resolver.createLocalContext(context);
        var matched = false;
        var defaultBlock;
        for (var _i = 0, _a = spec.cases; _i < _a.length; _i++) {
            var item = _a[_i];
            var block = this.getCaseBlock(item, localContext, resolver);
            if ('case' in block) {
                if (!matched) {
                    matched = (block.case === spec.value);
                }
                if (matched) {
                    var result = this._stepHandler.runSteps(block.steps, localContext, resolver);
                    if (result.directiveId != null) {
                        return result.value;
                    }
                }
            }
            else if (defaultBlock == null) {
                defaultBlock = block;
            }
        }
        if (!matched && defaultBlock != null) {
            var result = this._stepHandler.runSteps(defaultBlock.steps, localContext, resolver);
            return result;
        }
    };
    /**
     * Converts a value to a case block.
     * @function
     * @param {unknown} source - value to be converted
     * @param {KeyValueMap} context - extra data to be made available for resolution
     * @param {KeyedTemplateResolver} resolver - template resolver to be used
     * @returns {SwitchDirectiveBlock} converted value as a case block
     */
    SwitchDirective.prototype.getCaseBlock = function (source, context, resolver) {
        if (typeof source === 'object' && source != null) {
            if (Array.isArray(source)) {
                return {
                    steps: source
                };
            }
            var valueMap = source;
            var result = {
                steps: resolver.getArray(valueMap.steps, context)
            };
            if ('case' in valueMap) {
                result.case = resolver.resolveValue(valueMap.case, context);
            }
            return result;
        }
        return {
            steps: source !== undefined ? [source] : []
        };
    };
    return SwitchDirective;
}());
exports.SwitchDirective = SwitchDirective;
