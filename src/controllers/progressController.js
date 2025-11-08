import UserProgress from "../models/userProgress.js";
import AlphabetProgress from "../models/alphabetProgress.js";
import WordProgress from "../models/wordProgress.js";
import Achievement from "../models/achievement.js";

// Get user dashboard (overview of all progress)
export const getDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get or create user progress
        let userProgress = await UserProgress.findOne({ userId });
        if (!userProgress) {
            userProgress = await UserProgress.create({ userId });
        }

        // Get alphabet progress summary
        const alphabetProgress = await AlphabetProgress.find({ userId });
        const alphabetsCompleted = alphabetProgress.filter(a => a.status === 'completed').length;
        const alphabetsInProgress = alphabetProgress.filter(a => a.status === 'in_progress').length;

        // Get word progress summary
        const wordProgress = await WordProgress.find({ userId });
        const wordsMastered = wordProgress.filter(w => w.status === 'mastered').length;
        const wordsInProgress = wordProgress.filter(w => w.status !== 'locked' && w.status !== 'mastered').length;

        // Get achievements
        const achievements = await Achievement.find({ userId }).sort({ unlockedAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalXP: userProgress.totalXP,
                    currentLevel: userProgress.currentLevel,
                    currentStreak: userProgress.currentStreak,
                    longestStreak: userProgress.longestStreak,
                    lastActivityDate: userProgress.lastActivityDate,
                },
                alphabets: {
                    completed: alphabetsCompleted,
                    inProgress: alphabetsInProgress,
                    total: 26,
                    unlocked: userProgress.alphabetsUnlocked,
                },
                words: {
                    mastered: wordsMastered,
                    inProgress: wordsInProgress,
                    byDifficulty: userProgress.wordsProgress,
                    overallAccuracy: userProgress.overallAccuracy,
                },
                achievements: {
                    unlocked: achievements.length,
                    recent: achievements.slice(0, 3),
                },
                badges: userProgress.badges,
            },
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message,
        });
    }
};

// Get detailed stats
export const getStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const userProgress = await UserProgress.findOne({ userId });
        if (!userProgress) {
            return res.status(404).json({
                success: false,
                message: 'User progress not found',
            });
        }

        // Get all alphabet progress with details
        const alphabetProgress = await AlphabetProgress.find({ userId })
            .populate('alphabetId', 'letter order')
            .sort({ 'alphabetId.order': 1 });

        // Get all word progress with details
        const wordProgress = await WordProgress.find({ userId })
            .populate('wordId', 'word difficultyLevel rank')
            .sort({ masteredAt: -1 });

        // Calculate additional stats
        const totalAttempts = alphabetProgress.reduce((sum, a) => sum + a.attempts, 0);
        const successfulAttempts = alphabetProgress.reduce((sum, a) => sum + a.successfulAttempts, 0);
        const averageAccuracy = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                userProgress,
                alphabetProgress,
                wordProgress,
                statistics: {
                    totalAttempts,
                    successfulAttempts,
                    averageAccuracy: Math.round(averageAccuracy * 100) / 100,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message,
        });
    }
};

// Get alphabet progress list
export const getAlphabetProgress = async (req, res) => {
    try {
        const userId = req.user._id;

        const alphabetProgress = await AlphabetProgress.find({ userId })
            .populate('alphabetId')
            .sort({ 'alphabetId.order': 1 });

        res.status(200).json({
            success: true,
            data: alphabetProgress,
        });
    } catch (error) {
        console.error('Error fetching alphabet progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch alphabet progress',
            error: error.message,
        });
    }
};

// Get word progress list
export const getWordProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { difficulty, status, page = 1, limit = 20 } = req.query;

        // Build query
        const query = { userId };
        if (difficulty) query.difficultyLevel = difficulty;
        if (status) query.status = status;

        const skip = (page - 1) * limit;

        const wordProgress = await WordProgress.find(query)
            .populate('wordId')
            .sort({ masteredAt: -1, updatedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await WordProgress.countDocuments(query);

        res.status(200).json({
            success: true,
            data: wordProgress,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching word progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch word progress',
            error: error.message,
        });
    }
};
