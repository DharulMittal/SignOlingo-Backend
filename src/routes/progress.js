import express from "express";
import { checkLogin } from "../middlewares/authMiddleware.js";
import {
    getDashboard,
    getStats,
    getAlphabetProgress,
    getWordProgress,
} from "../controllers/progressController.js";
import {
    startAlphabet,
    practiceAlphabet,
    completeAlphabet,
} from "../controllers/alphabetProgressController.js";
import {
    completeStep1,
    attemptStep2,
    completeStep3,
    getWordWithProgress,
} from "../controllers/wordProgressController.js";
import {
    getAllAchievements,
    getUnlockedAchievements,
    getAchievementById,
} from "../controllers/achievementController.js";

const router = express.Router();

// All routes require authentication
router.use(checkLogin);

// ===== Dashboard & Stats =====
router.get("/dashboard", getDashboard);
router.get("/stats", getStats);

// ===== Alphabet Progress =====
router.get("/alphabets", getAlphabetProgress);
router.post("/alphabets/:letter/start", startAlphabet);
router.post("/alphabets/:letter/practice", practiceAlphabet);
router.post("/alphabets/:letter/complete", completeAlphabet);

// ===== Word Progress =====
router.get("/words", getWordProgress);
router.get("/words/:wordId", getWordWithProgress);
router.post("/words/:wordId/step1", completeStep1);
router.post("/words/:wordId/step2", attemptStep2);
router.post("/words/:wordId/step3", completeStep3);

// ===== Achievements =====
router.get("/achievements", getAllAchievements);
router.get("/achievements/unlocked", getUnlockedAchievements);
router.get("/achievements/:achievementId", getAchievementById);

export default router;
