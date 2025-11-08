import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        
        // Overall Stats
        totalXP: {
            type: Number,
            default: 0,
        },
        currentLevel: {
            type: Number,
            default: 1,
        },
        
        // Streak Tracking
        currentStreak: {
            type: Number,
            default: 0,
        },
        longestStreak: {
            type: Number,
            default: 0,
        },
        lastActivityDate: {
            type: Date,
            default: null,
        },
        
        // Alphabet Progress Summary
        alphabetsCompleted: {
            type: Number,
            default: 0,
        },
        alphabetsMastered: {
            type: [String],
            default: [],
        },
        alphabetsUnlocked: {
            type: Boolean,
            default: false,
        },
        
        // Words Progress by Difficulty
        wordsProgress: {
            veryEasy: {
                completed: { type: Number, default: 0 },
                total: { type: Number, default: 0 },
            },
            easy: {
                completed: { type: Number, default: 0 },
                total: { type: Number, default: 0 },
            },
            moderate: {
                completed: { type: Number, default: 0 },
                total: { type: Number, default: 0 },
            },
            hard: {
                completed: { type: Number, default: 0 },
                total: { type: Number, default: 0 },
            },
            veryHard: {
                completed: { type: Number, default: 0 },
                total: { type: Number, default: 0 },
            },
        },
        
        // Overall Accuracy
        overallAccuracy: {
            type: Number,
            default: 0,
        },
        
        // Achievements
        badges: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Method to calculate level from XP
userProgressSchema.methods.updateLevel = function() {
    this.currentLevel = Math.floor(this.totalXP / 100) + 1;
    return this.save();
};

// Method to update streak
userProgressSchema.methods.updateStreak = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!this.lastActivityDate) {
        this.currentStreak = 1;
        this.longestStreak = 1;
    } else {
        const lastActivity = new Date(this.lastActivityDate);
        lastActivity.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
            // Same day, no change
            return this;
        } else if (daysDiff === 1) {
            // Consecutive day
            this.currentStreak += 1;
            if (this.currentStreak > this.longestStreak) {
                this.longestStreak = this.currentStreak;
            }
        } else {
            // Streak broken
            this.currentStreak = 1;
        }
    }
    
    this.lastActivityDate = today;
    return this.save();
};

const UserProgress = mongoose.model("UserProgress", userProgressSchema);

export default UserProgress;
