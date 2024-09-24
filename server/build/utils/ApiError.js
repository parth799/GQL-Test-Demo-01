"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ApiError(message, statusCode) {
    const instance = new Error(message);
    instance.statusCode = statusCode;
    console.log("statusCode");
    Object.setPrototypeOf(instance, ApiError.prototype);
    return instance;
}
ApiError.prototype = Object.create(Error.prototype);
ApiError.prototype.constructor = ApiError;
exports.default = ApiError;
