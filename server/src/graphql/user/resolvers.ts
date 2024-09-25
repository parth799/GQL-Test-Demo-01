import UserService from "../../services/user";
import {
  CreateUserPayload,
  ChangePasswordPayload,
  UpdateAccountDetailsPayload,
  GetUserTokenPayload,
  CommonResponse,
  Context,
} from "../../services/user";

const queries = {
  userLogin: async (
    _: any,
    payload: GetUserTokenPayload & { includeUserData?: boolean }
  ): Promise<CommonResponse<{ token: string; user?: any }>> => {
    return await UserService.userLogin(payload);
  },

  getCurrentLoggedInUser: async (
    _: any,
    __: any,
    context: Context
  ): Promise<CommonResponse<{ user: any }>> => {
    if (!context || !context.user) {
      return {
        success: false,
        message: "Please log in first",
        statusCode: 401,
      };
    }

    const user: any = await UserService.getUserById(context.user.id);
    if (!user)
      return { success: false, message: "User not found", statusCode: 404 };

    return {
      success: true,
      message: "User fetched successfully",
      statusCode: 200,
      data: user,
    };
  },
};

const mutations = {
  createUser: async (
    _: any,
    payload: CreateUserPayload
  ): Promise<CommonResponse<any>> => {
    return await UserService.createUser(payload);
  },

  changePassword: async (
    _: any,
    payload: ChangePasswordPayload,
    context: Context
  ): Promise<CommonResponse<null>> => {
    if (!context || !context.user) {
      return {
        success: false,
        message: "Please log in first",
        statusCode: 401,
      };
    }
    return await UserService.changePassword({
      ...payload,
      userId: context.user.id,
    });
  },

  updateAccountDetails: async (
    _: any,
    payload: UpdateAccountDetailsPayload,
    context: Context
  ): Promise<CommonResponse<{ user: any }>> => {
    if (!context || !context.user) {
      return {
        success: false,
        message: "Please log in first",
        statusCode: 401,
      };
    }
    return await UserService.updateAccountDetails({
      ...payload,
      userId: context.user.id,
    });
  },
};

export const resolvers = { queries, mutations };
