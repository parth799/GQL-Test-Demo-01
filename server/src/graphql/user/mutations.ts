export const mutations = `#graphql
    createUser(firstName: String!, lastName: String!, email: String!, password: String!): String
    changePassword(currentPassword: String!, newPassword: String!): ChangePasswordResponse
    updateAccountDetails(email: String, lastName: String): Boolean
`;

