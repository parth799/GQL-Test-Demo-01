export const mutations = `#graphql
    createUser(firstName: String!, lastName: String!, email: String!, password: String!): CommonResponse
    changePassword(currentPassword: String!, newPassword: String!): CommonResponse
    updateAccountDetails(email: String, lastName: String): CommonResponse
`;