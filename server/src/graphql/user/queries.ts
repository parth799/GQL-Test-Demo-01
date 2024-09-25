export const queries = `#graphql
    userLogin(email: String!, password: String!): CommonResponse
    getCurrentLoggedInUser: CommonResponse
`;