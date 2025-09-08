import express from 'express';
import { 
    createAlphabet,
    getAllAlphabets,
    getAlphabetByLetter,
    updateAlphabet,
    deleteAlphabet
} from '../controllers/alphabetController.js';

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Alphabets page");
});

// POST /alphabets - Create alphabet with image
router.post("/set", createAlphabet);

// GET /alphabets/all - Get all alphabets
router.get("/all", getAllAlphabets);

// GET /alphabets/:letter - Get specific alphabet
router.get("/:letter", getAlphabetByLetter);

// PUT /alphabets/:letter - Update alphabet
router.put("/:letter", updateAlphabet);

// DELETE /alphabets/:letter - Delete alphabet
router.delete("/:letter", deleteAlphabet);

export default router;
