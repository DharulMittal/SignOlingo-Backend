import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        achievementId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        xpReward: {
            type: Number,
            default: 0,
        },
        unlockedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for unique user-achievement combination
achievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

// Static method to get available achievements
achievementSchema.statics.getAvailableAchievements = function() {
    return [
        {
            achievementId: 'first_steps',
            name: 'First Steps',
            description: 'Complete your first alphabet',
            xpReward: 10,
        },
        {
            achievementId: 'alphabet_master',
            name: 'Alphabet Master',
            description: 'Complete all 26 alphabets',
            xpReward: 50,
        },
        {
            achievementId: 'word_explorer',
            name: 'Word Explorer',
            description: 'Complete your first word',
            xpReward: 10,
        },
        {
            achievementId: 'easy_learner',
            name: 'Easy Learner',
            description: 'Complete 10 "Very Easy" words',
            xpReward: 25,
        },
        {
            achievementId: 'dedicated_learner',
            name: 'Dedicated Learner',
            description: 'Maintain a 7-day learning streak',
            xpReward: 30,
        },
        {
            achievementId: 'quick_learner',
            name: 'Quick Learner',
            description: 'Complete 5 words in one day',
            xpReward: 20,
        },
        {
            achievementId: 'perfectionist',
            name: 'Perfectionist',
            description: 'Score 100% on 10 attempts',
            xpReward: 30,
        },
        {
            achievementId: 'sign_master',
            name: 'Sign Master',
            description: 'Master 50 words',
            xpReward: 50,
        },
        {
            achievementId: 'century_club',
            name: 'Century Club',
            description: 'Master 100 words',
            xpReward: 100,
        },
    ];
};

const Achievement = mongoose.model("Achievement", achievementSchema);

export default Achievement;
