import mongoose, {Document, Model, Schema, Types} from "mongoose";

type TweetDocument = Document & {
    author: Types.ObjectId;
    content: string;
    media?: string[];
    stats: {
        views?: number;
        likes?: number;
        retweets?: number;
        comments?: number;
    }
    isDraft?: boolean
}

const TweetSchema: Schema<TweetDocument> = new Schema<TweetDocument>({
    author: {
        type: Schema.Types.ObjectId,
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    media: [{
        type: String,
        required: true
    }],
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