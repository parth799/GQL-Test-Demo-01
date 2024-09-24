"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const user_1 = __importDefault(require("../../services/user"));
const queries = {
    getUserToken: (_, payload) => __awaiter(void 0, void 0, void 0, function* () {
        const token = yield user_1.default.getUserToken({
            email: payload.email,
            password: payload.password,
        });
        return token;
    }),
    getCurrentLoggedInUser: (_, parameters, context) => __awaiter(void 0, void 0, void 0, function* () {
        if (context && context.user) {
            const id = context.user.id;
            const user = yield user_1.default.getUserById(id);
            return user;
        }
        throw new Error("pleace login first");
    }),
};
const mutations = {
    createUser: (_, payload) => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield user_1.default.createUser(payload);
        return res.id;
    }),
    changePassword: (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () {
        if (!context || !context.user) {
            return {
                success: false,
                message: "Please login first.",
                statusCode: 401,
            };
        }
        const userId = context.user.id;
        try {
            const result = yield user_1.default.changePassword(Object.assign(Object.assign({}, payload), { userId }));
            if (result.statusCode === 400) {
                return {
                    success: false,
                    message: result.message,
                    statusCode: result.statusCode,
                };
            }
            return {
                success: true,
                message: "Password changed successfully!",
                statusCode: 200,
            };
        }
        catch (error) {
            return {
                success: false,
                message: "An error occurred while changing the password.",
                statusCode: 500,
            };
        }
    }),
    updateAccountDetails: (_, payload, context) => __awaiter(void 0, void 0, void 0, function* () {
        if (!context || !context.user) {
            throw new Error("Please login first");
        }
        const userId = context.user.id;
        const res = yield user_1.default.updateAccountDetails(Object.assign({ userId }, payload));
        return res;
    }),
};
exports.resolvers = { queries, mutations };
