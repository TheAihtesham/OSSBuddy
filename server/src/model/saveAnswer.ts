import mongoose ,{ Schema, Document, model, models } from "mongoose";

export interface IANSWER extends Document {
    repoURL: string;
    githubID?: mongoose.Types.ObjectId;
    question: string;
    answer: string;
    createdAt?: Date;
}

const answerSchema = new Schema<IANSWER>({
    githubID: {
         type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false
    },
    repoURL: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
)

export const saveAns = models.saveAns || model<IANSWER>('saveAnswer', answerSchema)