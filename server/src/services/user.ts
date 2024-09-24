import { createHmac, randomBytes } from "node:crypto";
import JWT from "jsonwebtoken";
import { prismaClient } from "../lib/db";
import ApiError from "../utils/ApiError"


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


class UserService {
  private static generateHash(salt: string, password: string) {
    const hashedPassword = createHmac("sha256", salt)
      .update(password)
      .digest("hex");
    return hashedPassword;
  }

  public static getUserById(id: string) {
    return prismaClient.user.findUnique({ where: { id } });
  }

  public static createUser(payload: CreateUserPayload) {
    const { firstName, lastName, email, password } = payload;

    const salt = randomBytes(32).toString("hex");
    const hashedPassword = UserService.generateHash(salt, password);

    return prismaClient.user.create({
      data: {
        firstName,
        lastName,
        email,
        salt,
        password: hashedPassword,
      },
    });
  }

  private static getUserByEmail(email: string) {
    return prismaClient.user.findUnique({ where: { email } });
  }

  public static async getUserToken(payload: GetUserTokenPayload) {
    const { email, password } = payload;
    const user = await UserService.getUserByEmail(email);
    if (!user) throw new Error("user not found");

    const userSalt = user.salt;
    const usersHashPassword = UserService.generateHash(userSalt, password);

    if (usersHashPassword !== user.password)
      throw ApiError("Current password is incorrect", 400);

    const token = JWT.sign({ id: user.id, email: user.email }, JWT_SECRET);
    return token;
  }

  public static decodeJWTToken(token: string) {
    return JWT.verify(token, JWT_SECRET);
  }

  public static async changePassword(payload: ChangePasswordPayload) {
    const { userId, currentPassword, newPassword } = payload;

    const user = await UserService.getUserById(userId);
    if (!user) throw new Error("User not found");

    const userSalt = user.salt;
    const hashedCurrentPassword = UserService.generateHash(userSalt, currentPassword);
    if (hashedCurrentPassword !== user.password) {
      return { statusCode: 400, message: "Current password is incorrect" };
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

    return { statusCode: 200 };
  }

  public static async updateAccountDetails(payload: UpdateAccountDetailsPayload) {
    const { userId, email, lastName } = payload;

   if (email) {
      const emailExists = await prismaClient.user.findUnique({ where: { email } });
      if (emailExists && emailExists.id !== userId) {
        throw new Error("Email is already in use");
      }
    }

    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: {
        email: email || undefined, 
        lastName: lastName || undefined,
      },
    });

    return true;
  }
}

export default UserService;
