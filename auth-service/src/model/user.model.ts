import mongoose, {Document, Model, Schema} from "mongoose";

enum Role {
    USER = "user",
    ADMIN = "admin",
    SUPER_ADMIN = "super-admin"
}

type UserDocument = Document & {
    firstName?: string,
    lastName?: string,
    handle: string,
    displayName?: string
    email: string,
    mobile?: string,
    passwordHash: string,
    role?: string,
    avatar?: {
        publicId: string,
        url: string
    },
    banner?: {
        publicId: string,
        url: string
    },
    bio?: string,
    location?: string,
    dob?: string,
    isVerified: boolean,
    refreshToken: string

    getBasicInfo(): object;
}

const UserSchema: Schema<UserDocument> = new Schema<UserDocument>({
    firstName: String,
    lastName: String,
    handle: {
        type: String,
        required: true
    },
    displayName: String,
    email: String,
    mobile: String,
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: false,
        enum: Role,
        default: Role.USER
    },
    avatar: {
        publicId: String,
        url: String
    },
    banner: {
        publicId: String,
        url: String
    },
    bio: String,
    dob: Date,
    isVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: String
}, {
    timestamps: true
});


const UserModel: Model<UserDocument> = mongoose.model<UserDocument>("User", UserSchema);

UserModel.prototype.getBasicInfo = function () {
    const {id, firstName, lastName, email, handle, mobile, avatar} = this as UserDocument;

    return {id, firstName, lastName, handle, email, mobile, avatar};
}

export {
    UserDocument, UserModel
}