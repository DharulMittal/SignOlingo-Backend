import Alphabet from "../models/alphabet.js";
import AlphabetProgress from "../models/alphabetProgress.js";
import UserProgress from "../models/userProgress.js";
import Achievement from "../models/achievement.js";

// Start learning an alphabet
export const startAlphabet = async (req, res) => {
    try {
        const userId = req.user._id;
        const { letter } = req.params;

        // Find the alphabet
        const alphabet = await Alphabet.findOne({ letter: letter.toUpperCase() });
        if (!alphabet) {
            return res.status(404).json({
                success: false,
                message: 'Alphabet not found',
            });
        }

        // Check if alphabet is already started or completed
        let progress = await AlphabetProgress.findOne({ userId, alphabetId: alphabet._id });
        
        if (progress) {
            return res.status(200).json({
                success: true,
                message: 'Alphabet already in progress or completed',
                data: progress,
            });
        }

        // Create new progress
        progress = await AlphabetProgress.create({
            userId,
            alphabetId: alphabet._id,
            letter: alphabet.letter,
            status: 'in_progress',
        });

        res.status(201).json({
            success: true,
            message: 'Alphabet learning started',
            data: progress,
        });
    } catch (error) {
        console.error('Error starting alphabet:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start alphabet learning',
            error: error.message,
        });
    }
};

// Practice alphabet (update score)
export const practiceAlphabet = async (req, res) => {
    try {
        const userId = req.user._id;
        const { letter } = req.params;
        const { score } = req.body;

        if (score === undefined || score < 0 || score > 100) {
            return res.status(400).json({
                success: false,
                message: 'Score must be between 0 and 100',
            });
        }

        // Find the alphabet
        const alphabet = await Alphabet.findOne({ letter: letter.toUpperCase() });
        if (!alphabet) {
            return res.status(404).json({
                success: false,
                message: 'Alphabet not found',
            });
        }

        // Find or create progress
        let progress = await AlphabetProgress.findOne({ userId, alphabetId: alphabet._id });
        if (!progress) {
            progress = await AlphabetProgress.create({
                userId,
                alphabetId: alphabet._id,
                letter: alphabet.letter,
                status: 'in_progress',
            });
        }

        // Update score
        progress.updateScore(score);
        await progress.save();

        // Update user's last activity
        await UserProgress.findOneAndUpdate(
            { userId },
            { lastActivityDate: new Date() },
            { upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Practice score recorded',
            data: progress,
        });
    } catch (error) {
        console.error('Error practicing alphabet:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record practice score',
            error: error.message,
        });
    }
};

// Complete alphabet (final submission)
export const completeAlphabet = async (req, res) => {
    try {
        const userId = req.user._id;
        const { letter } = req.params;
        const { finalScore } = req.body;

        if (finalScore === undefined || finalScore < 0 || finalScore > 100) {
            return res.status(400).json({
                success: false,
                message: 'Final score must be between 0 and 100',
            });
        }

        // Find the alphabet
        const alphabet = await Alphabet.findOne({ letter: letter.toUpperCase() });
        if (!alphabet) {
            return res.status(404).json({
                success: false,
                message: 'Alphabet not found',
            });
        }

        // Find progress
        let progress = await AlphabetProgress.findOne({ userId, alphabetId: alphabet._id });
        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Alphabet progress not found. Please start learning first.',
            });
        }

        if (progress.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Alphabet already completed',
            });
        }

        // Update final score
        progress.updateScore(finalScore);
        progress.markCompleted();
        await progress.save();

        // Update user progress
        let userProgress = await UserProgress.findOne({ userId });
        if (!userProgress) {
            userProgress = await UserProgress.create({ userId });
        }

        // Add XP
        userProgress.totalXP += progress.xpEarned;
        userProgress.alphabetsCompleted += 1;
        userProgress.alphabetsMastered.addToSet(alphabet._id);
        userProgress.lastActivityDate = new Date();

        // Check if all alphabets are completed
        if (userProgress.alphabetsCompleted === 26) {
            userProgress.alphabetsUnlocked = true;
            
            // Award "Alphabet Master" achievement
            await checkAndUnlockAchievement(userId, 'alphabet_master', userProgress);
        }

        // Check for "First Steps" achievement
        if (userProgress.alphabetsCompleted === 1) {
            await checkAndUnlockAchievement(userId, 'first_steps', userProgress);
        }

        // Update level
        userProgress.updateLevel();
        
        // Update streak
        userProgress.updateStreak();
        
        await userProgress.save();

        res.status(200).json({
            success: true,
            message: 'Alphabet completed successfully!',
            data: {
                alphabetProgress: progress,
                userProgress: {
                    totalXP: userProgress.totalXP,
                    currentLevel: userProgress.currentLevel,
                    alphabetsCompleted: userProgress.alphabetsCompleted,
                    wordsUnlocked: userProgress.alphabetsUnlocked,
                },
            },
        });
    } catch (error) {
        console.error('Error completing alphabet:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete alphabet',
            error: error.message,
        });
    }
};

// Helper function to check and unlock achievements
async function checkAndUnlockAchievement(userId, achievementId, userProgress) {
    try {
        // Check if achievement already exists
        const existingAchievement = await Achievement.findOne({ userId, achievementId });
        if (existingAchievement) return;

        // Get achievement details
        const availableAchievements = Achievement.getAvailableAchievements();
        const achievementData = availableAchievements.find(a => a.achievementId === achievementId);
        
        if (!achievementData) return;

        // Create achievement
        const achievement = await Achievement.create({
            userId,
            ...achievementData,
        });

        // Add XP reward
        userProgress.totalXP += achievementData.xpReward;
        
        // Add badge
        userProgress.badges.push({
            achievementId: achievementData.achievementId,
            name: achievementData.name,
            unlockedAt: new Date(),
        });

        console.log(`Achievement unlocked: ${achievementData.name} for user ${userId}`);
    } catch (error) {
        console.error('Error unlocking achievement:', error);
    }
}

export { checkAndUnlockAchievement };
