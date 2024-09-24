export const typeDefs = `#graphql
    type User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
        profileImageURL: String
    }

    type ChangePasswordResponse {
        success: Boolean
        message: String
        statusCode: Int
    }
`;