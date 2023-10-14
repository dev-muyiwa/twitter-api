import mongoose, {Document, Model, Schema, Types} from "mongoose";

type FollowingDocument = Document & {
    user: Types.ObjectId;
    following: Types.ObjectId;
}

const FollowingSchema: Schema<FollowingDocument> = new Schema<FollowingDocument>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    following: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, {timestamps: true});


const FollowingModel: Model<FollowingDocument> = mongoose.model("Following", FollowingSchema);

export {
    FollowingDocument, FollowingModel
}