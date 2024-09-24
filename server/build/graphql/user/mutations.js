"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutations = void 0;
exports.mutations = `#graphql
    createUser(firstName: String!, lastName: String!, email: String!, password: String!): String
    changePassword(currentPassword: String!, newPassword: String!): ChangePasswordResponse
    updateAccountDetails(email: String, lastName: String): Boolean
`;
