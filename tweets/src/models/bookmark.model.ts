import mongoose, {Document, Model, Schema, Types} from "mongoose";

type BookmarkDocument = Document & {
    user: Types.ObjectId,
    tweets: Types.ObjectId[]
}

const BookmarkSchema: Schema<BookmarkDocument> = new Schema<BookmarkDocument>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    tweets: [{
        type: Schema.Types.ObjectId,
        ref: "Tweet",
    }]
}, {timestamps: true});

const BookmarkModel: Model<BookmarkDocument> = mongoose.model("Bookmark", BookmarkSchema);

export {
    BookmarkModel, BookmarkDocument
}