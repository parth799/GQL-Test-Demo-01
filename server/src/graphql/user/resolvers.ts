import UserService, { ChangePasswordPayload, CreateUserPayload } from "../../services/user";

const queries = {
  getUserToken: async (
    _: any,
    payload: { email: string; password: string },
  ) => {
    const token = await UserService.getUserToken({
      email: payload.email,
      password: payload.password,
    });    
    return token;
  },
  getCurrentLoggedInUser: async (_: any, parameters: any, context: any) => {
    if (context && context.user) {
      const id = context.user.id;
      const user = await UserService.getUserById(id);
      return user;
    }
    throw new Error("pleace login first");
  },
};

const mutations = {
  createUser: async (_: any, payload: CreateUserPayload) => {
    const res = await UserService.createUser(payload);
    return res.id;
  },

  changePassword: async (_: any, payload: ChangePasswordPayload, context: any) => {
    if (!context || !context.user) {
      return {
        success: false,
        message: "Please login first.",
        statusCode: 401,
      };
    }

    const userId = context.user.id;

    try {
      const result = await UserService.changePassword({ ...payload, userId });
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
    } catch (error) {
      return {
        success: false,
        message: "An error occurred while changing the password.",
        statusCode: 500,
      };
    }
  },

  updateAccountDetails: async (_: any, payload: { email?: string; lastName?: string }, context: any) => {
    if (!context || !context.user) {
      throw new Error("Please login first");
    }

    const userId = context.user.id;
    const res = await UserService.updateAccountDetails({ userId, ...payload });
    return res;
  },
};


export const resolvers = { queries, mutations };