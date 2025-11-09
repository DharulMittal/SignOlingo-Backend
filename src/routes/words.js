import express from 'express';
import {
    getAllWords,
    searchWords,
    getWordByName,
    getWordsByDifficulty,
    getWordsByRank,
    getTestWords,
    createWord,
    bulkCreateWords,
    updateWord,
    updateVideo,
    addAlternative,
    removeAlternative,
    deleteWord,
    permanentDeleteWord
} from '../controllers/wordController.js';

const router = express.Router();

// Test route
router.get("/", (req, res) => {
    res.send("Words page");
});

// Public routes - specific routes before dynamic params
router.get("/all", getAllWords);

router.get("/search", searchWords);

router.get("/test", getTestWords);

router.get("/difficulty/:level", getWordsByDifficulty);

router.get("/rank/:min/:max", getWordsByRank);

// Admin routes - specific routes before dynamic params
router.post("/bulk", bulkCreateWords);

router.post("/", createWord);

// Dynamic parameter routes - these should be last
router.get("/:word", getWordByName);

router.put("/:word", updateWord);

router.patch("/:word/video", updateVideo);

router.patch("/:word/alternatives", addAlternative);

router.delete("/:word/alternatives/:index", removeAlternative);

router.delete("/:word/hard", permanentDeleteWord);

router.delete("/:word", deleteWord);

export default router;