import { createHmac, randomBytes } from "node:crypto";
import JWT from "jsonwebtoken";
import { prismaClient } from "../lib/db";

const JWT_SECRET = "$123456789";

export interface CreateUserPayload {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface GetUserTokenPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface UpdateAccountDetailsPayload {
  userId: string;
  email?: string;
  lastName?: string;
}

export interface Context {
  user?: {
    id: string;
    email: string;
  };
}

export interface CommonResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
}

class UserService {
  private static generateHash(salt: string, password: string): string {
    return createHmac("sha256", salt).update(password).digest("hex");
  }

  public static async getUserById(id: string) {
    return prismaClient.user.findUnique({ where: { id } });
  }

  public static async createUser(
    payload: CreateUserPayload
  ): Promise<CommonResponse<{ user: any }>> {
    const { firstName, lastName, email, password } = payload;
    const salt = randomBytes(32).toString("hex");
    const hashedPassword = UserService.generateHash(salt, password);

    try {
      const newUser: any = await prismaClient.user.create({
        data: {
          firstName,
          lastName,
          email,
          salt,
          password: hashedPassword,
        },
      });
      return {
        success: true,
        message: "User created successfully",
        statusCode: 201,
        data: newUser,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to create user",
        statusCode: 500,
      };
    }
  }

  private static async getUserByEmail(email: string) {
    return prismaClient.user.findUnique({ where: { email } });
  }

  public static async userLogin(
    payload: GetUserTokenPayload
  ): Promise<CommonResponse<{ token: string }>> {
    const { email, password } = payload;
    const user: any = await UserService.getUserByEmail(email);
    if (!user)
      return { success: false, message: "User not found", statusCode: 404 };

    const hashedPassword = UserService.generateHash(user.salt, password);
    if (hashedPassword !== user.password)
      return { success: false, message: "Incorrect password", statusCode: 401 };

    const token = JWT.sign({ id: user.id, email: user.email }, JWT_SECRET);
    return {
      success: true,
      message: "Token generated successfully",
      statusCode: 200,
      data: { token:token, ...user},
    };
  }

  public static decodeJWTToken(token: string) {
    try {
      return JWT.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  public static async changePassword(
    payload: ChangePasswordPayload
  ): Promise<CommonResponse<null>> {
    const { userId, currentPassword, newPassword } = payload;
    const user = await UserService.getUserById(userId);
    if (!user)
      return { success: false, statusCode: 404, message: "User not found" };

    const hashedCurrentPassword = UserService.generateHash(
      user.salt,
      currentPassword
    );
    if (hashedCurrentPassword !== user.password) {
      return {
        success: false,
        statusCode: 400,
        message: "Current password is incorrect",
      };
    }

    const newSalt = randomBytes(32).toString("hex");
    const hashedNewPassword = UserService.generateHash(newSalt, newPassword);

    await prismaClient.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        salt: newSalt,
      },
    });

    return {
      success: true,
      message: "Password changed successfully",
      statusCode: 200,
    };
  }

  public static async updateAccountDetails(
    payload: UpdateAccountDetailsPayload
  ): Promise<CommonResponse<{ user: any }>> {
    const { userId, email, lastName } = payload;
  
    const user = await prismaClient.user.findUnique({
      where: { id: userId }, 
    });
  
    if (!user) {
      return {
        success: false,
        message: "User not found",
        statusCode: 404,
      };
    }
  
    if (email) {
      const emailExists = await prismaClient.user.findUnique({
        where: { email },
      });
  
      if (emailExists && emailExists.id !== userId) {
        return {
          success: false,
          message: "Email is already in use",
          statusCode: 400,
        };
      }
    }
  
    try {
      const updatedUser:any = await prismaClient.user.update({
        where: { id: userId },
        data: {
          email: email || undefined, 
          lastName: lastName || undefined,
        },
      });
  
      return {
        success: true,
        message: "Account details updated",
        statusCode: 200,
        data: updatedUser ,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to update account details",
        statusCode: 500,
      };
    }
  }
  
}

export default UserService;
