import Word from '../models/word.js';

// Get all words with pagination, filtering, and sorting
export const getAllWords = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            difficulty, 
            sort = 'rank' 
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build filter
        const filter = {};
        // Only filter by isActive if it exists in the documents
        // For backward compatibility with existing data without isActive field
        if (difficulty) {
            filter.difficulty_level = difficulty;
        }

        // Build sort
        const sortOption = {};
        if (sort === 'rank' || sort === '-rank') {
            sortOption.rank = sort === '-rank' ? -1 : 1;
        } else if (sort === 'word' || sort === '-word') {
            sortOption.word = sort === '-word' ? -1 : 1;
        } else if (sort === 'difficulty_level' || sort === '-difficulty_level') {
            sortOption.difficulty_level = sort === '-difficulty_level' ? -1 : 1;
        } else if (sort === 'heuristic_score' || sort === '-heuristic_score') {
            sortOption.heuristic_score = sort === '-heuristic_score' ? -1 : 1;
        } else {
            sortOption.rank = 1; // default
        }

        const words = await Word.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        const total = await Word.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "Words retrieved successfully",
            data: words,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalWords: total,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error("Get all words error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Search words
export const searchWords = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const words = await Word.find({
            word: { $regex: q, $options: 'i' }
        }).sort({ rank: 1 });

        res.status(200).json({
            success: true,
            message: "Search results",
            count: words.length,
            data: words
        });

    } catch (error) {
        console.error("Search words error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get specific word by name
export const getWordByName = async (req, res) => {
    try {
        const { word } = req.params;

        const foundWord = await Word.findOne({
            word: word.toLowerCase()
        });

        if (!foundWord) {
            return res.status(404).json({
                success: false,
                message: "Word not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Word retrieved successfully",
            data: foundWord
        });

    } catch (error) {
        console.error("Get word error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get words by difficulty level
export const getWordsByDifficulty = async (req, res) => {
    try {
        const { level } = req.params;
        const { page = 1, limit = 20, sort = 'rank' } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Validate difficulty level
        const validLevels = ['Very easy', 'Easy', 'Moderate', 'Hard', 'Very hard'];
        if (!validLevels.includes(level)) {
            return res.status(400).json({
                success: false,
                message: "Invalid difficulty level"
            });
        }

        // Build sort
        const sortOption = {};
        if (sort === 'rank' || sort === '-rank') {
            sortOption.rank = sort === '-rank' ? -1 : 1;
        } else if (sort === 'word' || sort === '-word') {
            sortOption.word = sort === '-word' ? -1 : 1;
        } else {
            sortOption.rank = 1; // default
        }

        const words = await Word.find({
            difficulty_level: level
        })
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        const total = await Word.countDocuments({
            difficulty_level: level
        });

        res.status(200).json({
            success: true,
            message: `Words with difficulty level: ${level}`,
            data: words,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalWords: total,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error("Get words by difficulty error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get words by rank range
export const getWordsByRank = async (req, res) => {
    try {
        const { min, max } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const minRank = parseInt(min);
        const maxRank = parseInt(max);

        const words = await Word.find({
            rank: { $gte: minRank, $lte: maxRank }
        })
            .sort({ rank: 1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Word.countDocuments({
            rank: { $gte: minRank, $lte: maxRank }
        });

        res.status(200).json({
            success: true,
            message: `Words with rank between ${minRank} and ${maxRank}`,
            data: words,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalWords: total,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error("Get words by rank error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get test words only
export const getTestWords = async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = 'rank' } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build sort
        const sortOption = {};
        if (sort === 'rank' || sort === '-rank') {
            sortOption.rank = sort === '-rank' ? -1 : 1;
        } else if (sort === 'word' || sort === '-word') {
            sortOption.word = sort === '-word' ? -1 : 1;
        } else if (sort === 'difficulty_level' || sort === '-difficulty_level') {
            sortOption.difficulty_level = sort === '-difficulty_level' ? -1 : 1;
        } else {
            sortOption.rank = 1; // default
        }

        const words = await Word.find({ test: true })
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        const total = await Word.countDocuments({ test: true });

        res.status(200).json({
            success: true,
            message: "Test words retrieved successfully",
            data: words,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalWords: total,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error("Get test words error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Create new word
export const createWord = async (req, res) => {
    try {
        const { word, video, alternatives, rank, heuristic_score, difficulty_level, test } = req.body;

        if (!word || !video) {
            return res.status(400).json({
                success: false,
                message: "Word and video are required"
            });
        }

        // Validate heuristic_score range
        if (heuristic_score !== undefined && (heuristic_score < -3 || heuristic_score > 5)) {
            return res.status(400).json({
                success: false,
                message: "Heuristic score must be between -3 and 5"
            });
        }

        // Check if word already exists
        const existingWord = await Word.findOne({ word: word.toLowerCase() });
        if (existingWord) {
            return res.status(400).json({
                success: false,
                message: "Word already exists"
            });
        }

        const newWord = new Word({
            word: word.toLowerCase(),
            video,
            alternatives: alternatives || [],
            rank: rank || 0,
            heuristic_score: heuristic_score || 0,
            difficulty_level: difficulty_level || 'Moderate',
            test: test || false
        });

        await newWord.save();

        res.status(201).json({
            success: true,
            message: "Word created successfully",
            data: newWord
        });

    } catch (error) {
        console.error("Create word error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Bulk create words
export const bulkCreateWords = async (req, res) => {
    try {
        const { words } = req.body;

        if (!words || !Array.isArray(words) || words.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Words array is required"
            });
        }

        const results = {
            created: [],
            failed: [],
            skipped: []
        };

        for (const wordData of words) {
            try {
                // Validate required fields
                if (!wordData.word || !wordData.video) {
                    results.failed.push({
                        word: wordData.word || 'unknown',
                        reason: 'Missing required fields'
                    });
                    continue;
                }

                // Validate heuristic_score
                if (wordData.heuristic_score !== undefined && 
                    (wordData.heuristic_score < -3 || wordData.heuristic_score > 5)) {
                    results.failed.push({
                        word: wordData.word,
                        reason: 'Invalid heuristic_score (must be -3 to 5)'
                    });
                    continue;
                }

                // Check if word exists
                const existing = await Word.findOne({ word: wordData.word.toLowerCase() });
                if (existing) {
                    results.skipped.push({
                        word: wordData.word,
                        reason: 'Already exists'
                    });
                    continue;
                }

                // Create word
                const newWord = new Word({
                    word: wordData.word.toLowerCase(),
                    video: wordData.video,
                    alternatives: wordData.alternatives || [],
                    rank: wordData.rank || 0,
                    heuristic_score: wordData.heuristic_score || 0,
                    difficulty_level: wordData.difficulty_level || 'Moderate',
                    test: wordData.test || false
                });

                await newWord.save();
                results.created.push(wordData.word);

            } catch (err) {
                results.failed.push({
                    word: wordData.word || 'unknown',
                    reason: err.message
                });
            }
        }

        res.status(201).json({
            success: true,
            message: "Bulk import completed",
            summary: {
                total: words.length,
                created: results.created.length,
                skipped: results.skipped.length,
                failed: results.failed.length
            },
            details: results
        });

    } catch (error) {
        console.error("Bulk create words error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update word
export const updateWord = async (req, res) => {
    try {
        const { word } = req.params;
        const { video, alternatives, rank, heuristic_score, difficulty_level, test } = req.body;

        // Validate heuristic_score if provided
        if (heuristic_score !== undefined && (heuristic_score < -3 || heuristic_score > 5)) {
            return res.status(400).json({
                success: false,
                message: "Heuristic score must be between -3 and 5"
            });
        }

        const updateData = {};
        if (video !== undefined) updateData.video = video;
        if (alternatives !== undefined) updateData.alternatives = alternatives;
        if (rank !== undefined) updateData.rank = rank;
        if (heuristic_score !== undefined) updateData.heuristic_score = heuristic_score;
        if (difficulty_level !== undefined) updateData.difficulty_level = difficulty_level;
        if (test !== undefined) updateData.test = test;

        const updatedWord = await Word.findOneAndUpdate(
            { word: word.toLowerCase() },
            updateData,
            { new: true }
        );

        if (!updatedWord) {
            return res.status(404).json({
                success: false,
                message: "Word not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Word updated successfully",
            data: updatedWord
        });

    } catch (error) {
        console.error("Update word error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update primary video only
export const updateVideo = async (req, res) => {
    try {
        const { word } = req.params;
        const { video } = req.body;

        if (!video) {
            return res.status(400).json({
                success: false,
                message: "Video URL is required"
            });
        }

        const updatedWord = await Word.findOneAndUpdate(
            { word: word.toLowerCase() },
            { video },
            { new: true }
        );

        if (!updatedWord) {
            return res.status(404).json({
                success: false,
                message: "Word not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Video updated successfully",
            data: updatedWord
        });

    } catch (error) {
        console.error("Update video error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Add alternative video
export const addAlternative = async (req, res) => {
    try {
        const { word } = req.params;
        const { alternative } = req.body;

        if (!alternative) {
            return res.status(400).json({
                success: false,
                message: "Alternative video URL is required"
            });
        }

        const updatedWord = await Word.findOneAndUpdate(
            { word: word.toLowerCase() },
            { $addToSet: { alternatives: alternative } },
            { new: true }
        );

        if (!updatedWord) {
            return res.status(404).json({
                success: false,
                message: "Word not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Alternative video added successfully",
            data: updatedWord
        });

    } catch (error) {
        console.error("Add alternative error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Remove alternative video by index
export const removeAlternative = async (req, res) => {
    try {
        const { word, index } = req.params;
        const indexNum = parseInt(index);

        const foundWord = await Word.findOne({ word: word.toLowerCase() });

        if (!foundWord) {
            return res.status(404).json({
                success: false,
                message: "Word not found"
            });
        }

        if (indexNum < 0 || indexNum >= foundWord.alternatives.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid alternative index"
            });
        }

        foundWord.alternatives.splice(indexNum, 1);
        await foundWord.save();

        res.status(200).json({
            success: true,
            message: "Alternative video removed successfully",
            data: foundWord
        });

    } catch (error) {
        console.error("Remove alternative error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Soft delete word
export const deleteWord = async (req, res) => {
    try {
        const { word } = req.params;

        const deletedWord = await Word.findOneAndUpdate(
            { word: word.toLowerCase() },
            { isActive: false },
            { new: true }
        );

        if (!deletedWord) {
            return res.status(404).json({
                success: false,
                message: "Word not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Word deleted successfully",
            data: deletedWord
        });

    } catch (error) {
        console.error("Delete word error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Permanently delete word
export const permanentDeleteWord = async (req, res) => {
    try {
        const { word } = req.params;

        const deletedWord = await Word.findOneAndDelete({
            word: word.toLowerCase()
        });

        if (!deletedWord) {
            return res.status(404).json({
                success: false,
                message: "Word not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Word permanently deleted"
        });

    } catch (error) {
        console.error("Permanent delete word error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};