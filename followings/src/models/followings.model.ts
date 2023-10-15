import mongoose, {Document, Model, Schema, Types} from "mongoose";
import paginate from 'mongoose-paginate-v2';

type FollowingDocument = Document & {
    user: Types.ObjectId;
    following: Types.ObjectId;
    timestamp?: string
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
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }
});

FollowingSchema.plugin(paginate);

const FollowingModel = mongoose.model<FollowingDocument, mongoose.PaginateModel<FollowingDocument>>("Following", FollowingSchema);

export {
    FollowingDocument, FollowingModel
}