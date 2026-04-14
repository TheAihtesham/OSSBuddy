import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IBOOKMARK extends Document {
    githubID: mongoose.Types.ObjectId;
    repoURL: string;
    name: string;
    description: string;
    stargazers_count: number;
    forks: number;
    language?: string;
    createdAt?: Date;
}

const bookmarkSchema = new Schema<IBOOKMARK>({
    githubID: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false
    },
    repoURL: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    stargazers_count: {
        type: Number
    },
    forks: {
        type: Number
    },
    language: {
        type: String
    }
},
{
    timestamps: true
}
);

export const Bookmark = models.Bookmarks || model<IBOOKMARK>('Bookmarks', bookmarkSchema);