import {UserDocument, UserModel} from "../model/user.model";
import {CustomError} from "@dev-muyiwa/shared-service";
import {isValidObjectId} from "mongoose";


const createUser = async () => {

}

const findUser = async (username: string) => {
    console.log("Handle:", username)
    const user: UserDocument | null = await UserModel.findOne({
        $or: [{email: username}, {mobile: username}, {handle: username}]
    })

    if (!user) {
        throw new CustomError("User does not exist", CustomError.BAD_REQUEST);
    }

    return user;
}

const findUserBy = async (id: string | undefined) => {
    const user: UserDocument | null = await UserModel.findById(id);

    if (!user) {
        throw new CustomError("User does not exist", CustomError.BAD_REQUEST);
    }

    return user;
}


export {
    findUser,
    findUserBy
}