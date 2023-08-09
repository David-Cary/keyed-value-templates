"use strict";
/*
import {
  type KeyValueMap
} from './basic-types'
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TYPE_CONVERSIONS = exports.getConversionToString = exports.getConversionToBoolean = void 0;
function getConversionToBoolean(options) {
    return function (value) {
        if ((options === null || options === void 0 ? void 0 : options.default) !== undefined && value === undefined) {
            return options.default;
        }
        return Boolean(value);
    };
}
exports.getConversionToBoolean = getConversionToBoolean;
function getConversionToString(options) {
    return function (value) {
        if (options != null) {
            if (options.useJSON) {
                try {
                    return JSON.stringify(value);
                }
                catch (error) { }
            }
            if (options.default !== undefined && value === undefined) {
                return options.default;
            }
        }
        return String(value);
    };
}
exports.getConversionToString = getConversionToString;
exports.DEFAULT_TYPE_CONVERSIONS = {
    boolean: getConversionToBoolean,
    string: getConversionToString
};
