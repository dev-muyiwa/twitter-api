import mongoose, {Document, Model, Schema, Types} from "mongoose";

type MediaDocument = Document & {
    publicId: string,
    url: string
}

type TweetDocument = Document & {
    author: Types.ObjectId;
    parent?: Types.ObjectId;
    content: string;
    media: MediaDocument[];
    stats: {
        views?: number;
        likes?: number;
        retweets?: number;
        comments?: number;
    }
    isDraft?: boolean
}

const MediaSchema: Schema<MediaDocument> = new Schema<MediaDocument>({
    publicId: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
})

const TweetSchema: Schema<TweetDocument> = new Schema<TweetDocument>({
    author: {
        type: Schema.Types.ObjectId,
        required: true
    },
    parent: {
        type: Schema.Types.ObjectId,
        default: null,
        ref: "Tweet"
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    media: [MediaSchema],
    stats: {
        views: {
            type: Number,
            default: 0
        },
        likes: {
            type: Number,
            default: 0
        },
        retweets: {
            type: Number,
            default: 0
        },
        comments: {
            type: Number,
            default: 0
        },
    },
    isDraft: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const TweetModel: Model<TweetDocument> = mongoose.model("Tweet", TweetSchema);

export {
    TweetDocument, TweetModel
}