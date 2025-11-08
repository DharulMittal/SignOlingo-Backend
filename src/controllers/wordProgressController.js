import Word from "../models/word.js";
import WordProgress from "../models/wordProgress.js";
import UserProgress from "../models/userProgress.js";
import Achievement from "../models/achievement.js";
import { checkAndUnlockAchievement } from "./alphabetProgressController.js";

// Step 1: Watch video and learn word (2 XP)
export const completeStep1 = async (req, res) => {
    try {
        const userId = req.user._id;
        const { wordId } = req.params;

        // Check if alphabets are unlocked
        const userProgress = await UserProgress.findOne({ userId });
        if (!userProgress || !userProgress.alphabetsUnlocked) {
            return res.status(403).json({
                success: false,
                message: 'You must complete all 26 alphabets before learning words',
            });
        }

        // Find the word
        const word = await Word.findById(wordId);
        if (!word) {
            return res.status(404).json({
                success: false,
                message: 'Word not found',
            });
        }

        // Find or create word progress
        let progress = await WordProgress.findOne({ userId, wordId });
        if (!progress) {
            progress = await WordProgress.create({
                userId,
                wordId,
                word: word.word,
                difficultyLevel: word.difficultyLevel,
            });
        }

        // Complete step 1
        const result = progress.completeStep1();
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message,
            });
        }

        await progress.save();

        // Update user progress
        userProgress.totalXP += 2;
        userProgress.lastActivityDate = new Date();
        userProgress.updateLevel();
        userProgress.updateStreak();
        await userProgress.save();

        res.status(200).json({
            success: true,
            message: 'Step 1 completed! You earned 2 XP.',
            data: {
                wordProgress: progress,
                xpEarned: 2,
                currentLevel: userProgress.currentLevel,
                totalXP: userProgress.totalXP,
            },
        });
    } catch (error) {
        console.error('Error completing step 1:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete step 1',
            error: error.message,
        });
    }
};

// Step 2: Type the word from video (3 XP)
export const attemptStep2 = async (req, res) => {
    try {
        const userId = req.user._id;
        const { wordId } = req.params;
        const { typedWord, score } = req.body;

        if (!typedWord) {
            return res.status(400).json({
                success: false,
                message: 'Typed word is required',
            });
        }

        if (score === undefined || score < 0 || score > 100) {
            return res.status(400).json({
                success: false,
                message: 'Score must be between 0 and 100',
            });
        }

        // Find word progress
        const progress = await WordProgress.findOne({ userId, wordId });
        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Word progress not found. Please complete step 1 first.',
            });
        }

        // Attempt step 2
        const result = progress.attemptStep2(score);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message,
            });
        }

        await progress.save();

        // Update user progress if step 2 is completed
        let xpEarned = 0;
        if (result.completed) {
            const userProgress = await UserProgress.findOne({ userId });
            userProgress.totalXP += 3;
            xpEarned = 3;
            userProgress.lastActivityDate = new Date();
            userProgress.updateLevel();
            userProgress.updateStreak();
            await userProgress.save();
        }

        res.status(200).json({
            success: true,
            message: result.completed 
                ? 'Step 2 completed! You earned 3 XP.' 
                : `Attempt recorded. Score: ${score}%. Try again to complete this step.`,
            data: {
                wordProgress: progress,
                xpEarned,
                completed: result.completed,
            },
        });
    } catch (error) {
        console.error('Error attempting step 2:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to attempt step 2',
            error: error.message,
        });
    }
};

// Step 3: Perform sign language (10 XP)
export const completeStep3 = async (req, res) => {
    try {
        const userId = req.user._id;
        const { wordId } = req.params;
        const { videoUrl, score } = req.body;

        if (!videoUrl) {
            return res.status(400).json({
                success: false,
                message: 'Video URL is required',
            });
        }

        if (score === undefined || score < 0 || score > 100) {
            return res.status(400).json({
                success: false,
                message: 'Score must be between 0 and 100',
            });
        }

        // Find word progress
        const progress = await WordProgress.findOne({ userId, wordId }).populate('wordId');
        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Word progress not found. Please complete step 1 first.',
            });
        }

        // Complete step 3
        const result = progress.completeStep3(videoUrl, score);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message,
            });
        }

        await progress.save();

        // Update user progress
        const userProgress = await UserProgress.findOne({ userId });
        userProgress.totalXP += 10;
        userProgress.lastActivityDate = new Date();

        // Update words progress by difficulty
        const difficultyKey = progress.difficultyLevel.toLowerCase().replace(' ', '');
        if (userProgress.wordsProgress[difficultyKey]) {
            userProgress.wordsProgress[difficultyKey].completed += 1;
        }

        // Update overall accuracy
        const allWordProgress = await WordProgress.find({ userId, status: 'mastered' });
        if (allWordProgress.length > 0) {
            const totalAccuracy = allWordProgress.reduce((sum, w) => sum + w.overallAccuracy, 0);
            userProgress.overallAccuracy = totalAccuracy / allWordProgress.length;
        }

        userProgress.updateLevel();
        userProgress.updateStreak();

        // Check for achievements
        await checkWordAchievements(userId, progress.difficultyLevel, userProgress);

        await userProgress.save();

        res.status(200).json({
            success: true,
            message: `Congratulations! Word mastered! You earned 10 XP.`,
            data: {
                wordProgress: progress,
                xpEarned: 10,
                currentLevel: userProgress.currentLevel,
                totalXP: userProgress.totalXP,
                isMastered: progress.isMastered(),
            },
        });
    } catch (error) {
        console.error('Error completing step 3:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete step 3',
            error: error.message,
        });
    }
};

// Get word details with progress
export const getWordWithProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { wordId } = req.params;

        const word = await Word.findById(wordId);
        if (!word) {
            return res.status(404).json({
                success: false,
                message: 'Word not found',
            });
        }

        const progress = await WordProgress.findOne({ userId, wordId });

        res.status(200).json({
            success: true,
            data: {
                word,
                progress: progress || null,
            },
        });
    } catch (error) {
        console.error('Error fetching word with progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch word details',
            error: error.message,
        });
    }
};

// Helper function to check word-related achievements
async function checkWordAchievements(userId, difficultyLevel, userProgress) {
    try {
        const masteredWords = await WordProgress.countDocuments({ 
            userId, 
            status: 'mastered' 
        });

        // Word Explorer - First word
        if (masteredWords === 1) {
            await checkAndUnlockAchievement(userId, 'word_explorer', userProgress);
        }

        // Sign Master - 50 words
        if (masteredWords === 50) {
            await checkAndUnlockAchievement(userId, 'sign_master', userProgress);
        }

        // Century Club - 100 words
        if (masteredWords === 100) {
            await checkAndUnlockAchievement(userId, 'century_club', userProgress);
        }

        // Easy Learner - 10 "Very Easy" words
        if (difficultyLevel === 'Very easy') {
            const veryEasyCompleted = await WordProgress.countDocuments({
                userId,
                difficultyLevel: 'Very easy',
                status: 'mastered'
            });

            if (veryEasyCompleted === 10) {
                await checkAndUnlockAchievement(userId, 'easy_learner', userProgress);
            }
        }

        // Check for perfectionist (10 perfect scores of 100)
        const perfectScores = await WordProgress.countDocuments({
            userId,
            'step3.score': 100,
            status: 'mastered'
        });

        if (perfectScores === 10) {
            await checkAndUnlockAchievement(userId, 'perfectionist', userProgress);
        }

        // Check Quick Learner (5 words in one day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const wordsCompletedToday = await WordProgress.countDocuments({
            userId,
            masteredAt: { $gte: today, $lt: tomorrow }
        });

        if (wordsCompletedToday === 5) {
            await checkAndUnlockAchievement(userId, 'quick_learner', userProgress);
        }

    } catch (error) {
        console.error('Error checking word achievements:', error);
    }
}
