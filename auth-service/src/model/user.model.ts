import mongoose, {Document, Model, Schema} from "mongoose";

type UserDocument = Document & {
    firstName?: string,
    lastName?: string,
    handle: string,
    displayName?: string
    email: string,
    mobile?: string,
    passwordHash: string,
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
    }
}, {
    timestamps: true
});


const UserModel: Model<UserDocument> = mongoose.model<UserDocument>("User", UserSchema);

export {
    UserDocument, UserModel
}