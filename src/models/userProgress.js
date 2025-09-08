import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        alphabetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Alphabet',
            required: true,
        },
        status: {
            type: String,
            enum: ['not_started', 'learning', 'completed'],
            default: 'not_started',
        },
        score: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        attempts: {
            type: Number,
            default: 0,
        },
        lastAttemptDate: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const UserProgress = mongoose.model("UserProgress", userProgressSchema);

export default UserProgress;
