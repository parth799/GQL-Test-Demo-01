export const typeDefs = `#graphql
    scalar Upload
    type Image {
        url: String!
    }

    type User {
        id: ID
        firstName: String
        lastName: String
        email: String
        avatar: Image 
        token: String
    }

    type CommonResponse {
        success: Boolean!
        message: String
        statusCode: Int
        data: User
    }

    type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

    scalar JSON
`;
