import mongoose from "mongoose";

const wordProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        wordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Word',
            required: true,
        },
        word: {
            type: String,
            required: true,
        },
        difficultyLevel: {
            type: String,
            required: true,
        },
        
        // Three-Step Learning Status
        currentStep: {
            type: Number,
            default: 1,
            min: 1,
            max: 3,
        },
        
        // Step 1: Watch video + see word (Learning)
        step1Completed: {
            type: Boolean,
            default: false,
        },
        step1CompletedAt: {
            type: Date,
            default: null,
        },
        
        // Step 2: Watch video → Type word (Recognition)
        step2Completed: {
            type: Boolean,
            default: false,
        },
        step2Attempts: {
            type: Number,
            default: 0,
        },
        step2Score: {
            type: Number,
            default: 0,
        },
        step2CompletedAt: {
            type: Date,
            default: null,
        },
        
        // Step 3: See word → Perform sign (Production)
        step3Completed: {
            type: Boolean,
            default: false,
        },
        step3VideoUrl: {
            type: String,
            default: null,
        },
        step3Score: {
            type: Number,
            default: 0,
        },
        step3Attempts: {
            type: Number,
            default: 0,
        },
        step3CompletedAt: {
            type: Date,
            default: null,
        },
        
        // Overall Status
        status: {
            type: String,
            enum: ['locked', 'step_1', 'step_2', 'step_3', 'mastered'],
            default: 'locked',
        },
        
        // Performance Metrics
        overallAccuracy: {
            type: Number,
            default: 0,
        },
        totalAttempts: {
            type: Number,
            default: 0,
        },
        
        // XP Tracking
        xpEarned: {
            type: Number,
            default: 0,
        },
        
        // Completion
        masteredAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for unique user-word combination
wordProgressSchema.index({ userId: 1, wordId: 1 }, { unique: true });
wordProgressSchema.index({ userId: 1, difficultyLevel: 1 });
wordProgressSchema.index({ userId: 1, status: 1 });

// Method to complete step 1 (Learning)
wordProgressSchema.methods.completeStep1 = function() {
    this.step1Completed = true;
    this.step1CompletedAt = new Date();
    this.currentStep = 2;
    this.status = 'step_2';
    this.xpEarned += 2; // 2 XP for step 1
    return this.save();
};

// Method to attempt step 2 (Recognition/Typing)
wordProgressSchema.methods.attemptStep2 = function(isCorrect) {
    this.step2Attempts += 1;
    this.totalAttempts += 1;
    
    if (isCorrect) {
        this.step2Completed = true;
        this.step2Score = 100;
        this.step2CompletedAt = new Date();
        this.currentStep = 3;
        this.status = 'step_3';
        this.xpEarned += 3; // 3 XP for step 2
    } else {
        this.step2Score = 0;
    }
    
    return this.save();
};

// Method to complete step 3 (Performance)
wordProgressSchema.methods.completeStep3 = function(videoUrl, score) {
    this.step3Attempts += 1;
    this.totalAttempts += 1;
    this.step3VideoUrl = videoUrl;
    this.step3Score = score;
    
    if (score >= 70) { // Consider 70%+ as pass for step 3
        this.step3Completed = true;
        this.step3CompletedAt = new Date();
        this.status = 'mastered';
        this.masteredAt = new Date();
        this.xpEarned += 10; // 10 XP for step 3
        
        // Calculate overall accuracy
        const step2Accuracy = this.step2Score;
        const step3Accuracy = this.step3Score;
        this.overallAccuracy = (step2Accuracy + step3Accuracy) / 2;
    }
    
    return this.save();
};

// Method to check if word is fully mastered
wordProgressSchema.methods.isMastered = function() {
    return this.step1Completed && this.step2Completed && this.step3Completed;
};

const WordProgress = mongoose.model("WordProgress", wordProgressSchema);

export default WordProgress;
