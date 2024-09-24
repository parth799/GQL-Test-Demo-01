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
const node_crypto_1 = require("node:crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../lib/db");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const JWT_SECRET = "$123456789";
class UserService {
    static generateHash(salt, password) {
        const hashedPassword = (0, node_crypto_1.createHmac)("sha256", salt)
            .update(password)
            .digest("hex");
        return hashedPassword;
    }
    static getUserById(id) {
        return db_1.prismaClient.user.findUnique({ where: { id } });
    }
    static createUser(payload) {
        const { firstName, lastName, email, password } = payload;
        const salt = (0, node_crypto_1.randomBytes)(32).toString("hex");
        const hashedPassword = UserService.generateHash(salt, password);
        return db_1.prismaClient.user.create({
            data: {
                firstName,
                lastName,
                email,
                salt,
                password: hashedPassword,
            },
        });
    }
    static getUserByEmail(email) {
        return db_1.prismaClient.user.findUnique({ where: { email } });
    }
    static getUserToken(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = payload;
            const user = yield UserService.getUserByEmail(email);
            if (!user)
                throw new Error("user not found");
            const userSalt = user.salt;
            const usersHashPassword = UserService.generateHash(userSalt, password);
            if (usersHashPassword !== user.password)
                throw (0, ApiError_1.default)("Current password is incorrect", 400);
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET);
            return token;
        });
    }
    static decodeJWTToken(token) {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    static changePassword(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, currentPassword, newPassword } = payload;
            const user = yield UserService.getUserById(userId);
            if (!user)
                throw new Error("User not found");
            const userSalt = user.salt;
            const hashedCurrentPassword = UserService.generateHash(userSalt, currentPassword);
            if (hashedCurrentPassword !== user.password) {
                return { statusCode: 400, message: "Current password is incorrect" };
            }
            const newSalt = (0, node_crypto_1.randomBytes)(32).toString("hex");
            const hashedNewPassword = UserService.generateHash(newSalt, newPassword);
            yield db_1.prismaClient.user.update({
                where: { id: userId },
                data: {
                    password: hashedNewPassword,
                    salt: newSalt,
                },
            });
            return { statusCode: 200 };
        });
    }
    static updateAccountDetails(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, email, lastName } = payload;
            // Check if email already exists in the system if the user wants to change it
            if (email) {
                const emailExists = yield db_1.prismaClient.user.findUnique({ where: { email } });
                if (emailExists && emailExists.id !== userId) {
                    throw new Error("Email is already in use");
                }
            }
            // Update the user's email and/or last name
            const updatedUser = yield db_1.prismaClient.user.update({
                where: { id: userId },
                data: {
                    email: email || undefined, // Only update email if provided
                    lastName: lastName || undefined, // Only update last name if provided
                },
            });
            return true;
        });
    }
}
exports.default = UserService;
