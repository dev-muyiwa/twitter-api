import mongoose, {Document, Model, Schema, Types} from "mongoose";
import paginate from "mongoose-paginate-v2";

type BookmarkDocument = Document & {
    user: Types.ObjectId,
    tweet: Types.ObjectId,
    timestamp?: string
}

const BookmarkSchema: Schema<BookmarkDocument> = new Schema<BookmarkDocument>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
        index: true
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet",
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }
});

BookmarkSchema.plugin(paginate);

const BookmarkModel = mongoose.model<BookmarkDocument, mongoose.PaginateModel<BookmarkDocument>>("Bookmark", BookmarkSchema);

export {
    BookmarkModel, BookmarkDocument
}