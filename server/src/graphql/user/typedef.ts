export const typeDefs = `#graphql
    type User {
        id: ID
        firstName: String
        lastName: String
        email: String
        profileImageURL: String
        token: String
    }

    type CommonResponse {
        success: Boolean!
        message: String
        statusCode: Int
        data: User
    }

    scalar JSON
`;
