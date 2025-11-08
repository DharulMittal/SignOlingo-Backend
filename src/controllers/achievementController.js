import Achievement from "../models/achievement.js";

// Get all available achievements (both locked and unlocked)
export const getAllAchievements = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get all available achievements
        const availableAchievements = Achievement.getAvailableAchievements();

        // Get user's unlocked achievements
        const unlockedAchievements = await Achievement.find({ userId });

        // Map achievements with unlock status
        const achievementsWithStatus = availableAchievements.map(achievement => {
            const unlocked = unlockedAchievements.find(
                u => u.achievementId === achievement.achievementId
            );

            return {
                ...achievement,
                isUnlocked: !!unlocked,
                unlockedAt: unlocked ? unlocked.unlockedAt : null,
            };
        });

        res.status(200).json({
            success: true,
            data: achievementsWithStatus,
            stats: {
                total: availableAchievements.length,
                unlocked: unlockedAchievements.length,
                locked: availableAchievements.length - unlockedAchievements.length,
            },
        });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch achievements',
            error: error.message,
        });
    }
};

// Get only unlocked achievements
export const getUnlockedAchievements = async (req, res) => {
    try {
        const userId = req.user._id;

        const unlockedAchievements = await Achievement.find({ userId })
            .sort({ unlockedAt: -1 });

        res.status(200).json({
            success: true,
            data: unlockedAchievements,
            count: unlockedAchievements.length,
        });
    } catch (error) {
        console.error('Error fetching unlocked achievements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unlocked achievements',
            error: error.message,
        });
    }
};

// Get achievement details
export const getAchievementById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { achievementId } = req.params;

        // Get achievement definition
        const availableAchievements = Achievement.getAvailableAchievements();
        const achievementDef = availableAchievements.find(
            a => a.achievementId === achievementId
        );

        if (!achievementDef) {
            return res.status(404).json({
                success: false,
                message: 'Achievement not found',
            });
        }

        // Check if unlocked
        const unlocked = await Achievement.findOne({ userId, achievementId });

        res.status(200).json({
            success: true,
            data: {
                ...achievementDef,
                isUnlocked: !!unlocked,
                unlockedAt: unlocked ? unlocked.unlockedAt : null,
            },
        });
    } catch (error) {
        console.error('Error fetching achievement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch achievement details',
            error: error.message,
        });
    }
};
