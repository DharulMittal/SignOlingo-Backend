import mongoose from "mongoose";

const alphabetProgressSchema = new mongoose.Schema(
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
        letter: {
            type: String,
            required: true,
        },
        
        // Status
        status: {
            type: String,
            enum: ['locked', 'in_progress', 'completed'],
            default: 'locked',
        },
        
        // Practice Attempts
        attempts: {
            type: Number,
            default: 0,
        },
        successfulAttempts: {
            type: Number,
            default: 0,
        },
        
        // Scores
        bestScore: {
            type: Number,
            default: 0,
        },
        lastScore: {
            type: Number,
            default: 0,
        },
        averageScore: {
            type: Number,
            default: 0,
        },
        
        // XP
        xpEarned: {
            type: Number,
            default: 0,
        },
        
        // Completion
        completedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for unique user-alphabet combination
alphabetProgressSchema.index({ userId: 1, alphabetId: 1 }, { unique: true });
alphabetProgressSchema.index({ userId: 1, letter: 1 });

// Method to update scores
alphabetProgressSchema.methods.updateScore = function(newScore) {
    this.attempts += 1;
    this.lastScore = newScore;
    
    // Update best score
    if (newScore > this.bestScore) {
        this.bestScore = newScore;
    }
    
    // Update successful attempts (>= 80% is success)
    if (newScore >= 80) {
        this.successfulAttempts += 1;
    }
    
    // Calculate average score
    if (this.attempts === 1) {
        this.averageScore = newScore;
    } else {
        this.averageScore = ((this.averageScore * (this.attempts - 1)) + newScore) / this.attempts;
    }
    
    return this.save();
};

// Method to mark as completed
alphabetProgressSchema.methods.markCompleted = function() {
    this.status = 'completed';
    this.completedAt = new Date();
    this.xpEarned = 5; // 5 XP per alphabet
    return this.save();
};

const AlphabetProgress = mongoose.model("AlphabetProgress", alphabetProgressSchema);

export default AlphabetProgress;
