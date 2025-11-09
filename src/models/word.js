import mongoose from "mongoose";

const wordSchema = new mongoose.Schema(
    {
        word: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        video: {
            type: String,
            required: true,
        },
        alternatives: {
            type: [String],
            default: [],
        },
        rank: {
            type: Number,
            default: 0,
        },
        heuristic_score: {
            type: Number,
            default: 0,
            min: -3,
            max: 5,
        },
        difficulty_level: {
            type: String,
            enum: ['Very easy', 'Easy', 'Moderate', 'Hard', 'Very hard'],
            default: 'Medium',
        },
        test: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Word = mongoose.model("Word", wordSchema);

export default Word;
