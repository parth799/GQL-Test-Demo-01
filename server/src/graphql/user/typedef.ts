export const typeDefs = `#graphql
    type Image {
        publicId: String!
        url: String!
    }

    type User {
        id: ID
        firstName: String
        lastName: String
        email: String
        profileImage: Image 
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
