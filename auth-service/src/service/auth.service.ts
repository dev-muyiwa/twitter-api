import {UserDocument, UserModel} from "../model/user.model";
import {CustomError} from "../utils/CustomError";
import bcrypt from "bcrypt";
import {config} from "../config/config";

export class RegisterData {
    firstName: string;
    lastName: string;
    handle: string;
    email: string;
    mobile: string;
    password: string
}

const createUser = async (data: RegisterData) => {
    const existingUser: UserDocument | null = await UserModel.findOne({
        $or: [{email: data.email}, {mobile: data.mobile}, {handle: data.handle}]
    });
    if (existingUser) {
        throw new CustomError("User(s) exists with this credential(s).", CustomError.BAD_REQUEST);
    }
    const user: UserDocument = await new UserModel({
        firstName: data.firstName,
        lastName: data.lastName,
        handle: data.handle,
        email: data.email,
        mobile: data.mobile,
        passwordHash: await bcrypt.hash(data.password, config.server.bcrypt_rounds)
    }).save();

    return user;
}

const findUser = async (username: string) => {
    const user: UserDocument | null = await UserModel.findOne({
        $or: [{email: username}, {mobile: username}, {handle: username}]
    });

    if (!user) {
        throw new CustomError("Invalid username/password.", CustomError.BAD_REQUEST);
    }

    return user.id;
}

const verify = async () => {

}

export const authService = {
    createUser, findUser
}