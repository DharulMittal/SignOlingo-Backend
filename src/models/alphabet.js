import mongoose from "mongoose";

const alphabetSchema = new mongoose.Schema(
    {
        letter: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            maxlength: 1,
        },
        demoImage: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Alphabet = mongoose.model("Alphabet", alphabetSchema);

export default Alphabet;
