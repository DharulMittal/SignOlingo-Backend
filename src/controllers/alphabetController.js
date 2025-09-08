import cloudinary from '../lib/claudinary.js';
import Alphabet from '../models/alphabet.js';

// Create alphabet with image
export const createAlphabet = async (req, res) => {
    try {
        const { letter, image } = req.body;

        if (!letter) {
            return res.status(400).json({
                success: false,
                message: "Letter is required"
            });
        }

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            });
        }

        const upperLetter = letter.toUpperCase();

        // Check if alphabet already exists
        const existingAlphabet = await Alphabet.findOne({ letter: upperLetter });
        if (existingAlphabet) {
            return res.status(400).json({
                success: false,
                message: "Alphabet already exists"
            });
        }

        // Upload image to Cloudinary
        const response = await cloudinary.uploader.upload(image, {
            folder: 'signolingo/alphabets',
            public_id: `alphabet_${upperLetter.toLowerCase()}`,
            overwrite: true
        });

        // Create new alphabet
        const newAlphabet = new Alphabet({
            letter: upperLetter,
            demoImage: response.secure_url
        });

        await newAlphabet.save();

        res.status(201).json({
            success: true,
            message: "Alphabet created successfully",
            data: newAlphabet
        });

    } catch (error) {
        console.error("Create alphabet error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get all alphabets
export const getAllAlphabets = async (req, res) => {
    try {
        const alphabets = await Alphabet.find({ isActive: true }).sort({ letter: 1 });

        res.status(200).json({
            success: true,
            message: "Alphabets retrieved successfully",
            count: alphabets.length,
            data: alphabets
        });

    } catch (error) {
        console.error("Get alphabets error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get specific alphabet by letter
export const getAlphabetByLetter = async (req, res) => {
    try {
        const { letter } = req.params;
        const upperLetter = letter.toUpperCase();

        const alphabet = await Alphabet.findOne({ 
            letter: upperLetter, 
            isActive: true 
        });

        if (!alphabet) {
            return res.status(404).json({
                success: false,
                message: "Alphabet not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Alphabet retrieved successfully",
            data: alphabet
        });

    } catch (error) {
        console.error("Get alphabet error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update alphabet
export const updateAlphabet = async (req, res) => {
    try {
        const { letter } = req.params;
        const { image, description } = req.body;
        const upperLetter = letter.toUpperCase();

        // Find existing alphabet
        const existingAlphabet = await Alphabet.findOne({ letter: upperLetter });
        if (!existingAlphabet) {
            return res.status(404).json({
                success: false,
                message: "Alphabet not found"
            });
        }

        const updateData = {};

        // Upload new image if provided
        if (image) {
            const response = await cloudinary.uploader.upload(image, {
                folder: 'signolingo/alphabets',
                public_id: `alphabet_${upperLetter.toLowerCase()}`,
                overwrite: true
            });
            updateData.demoImage = response.secure_url;
        }

        // Update description if provided
        if (description !== undefined) {
            updateData.description = description;
        }

        const updatedAlphabet = await Alphabet.findOneAndUpdate(
            { letter: upperLetter },
            updateData,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Alphabet updated successfully",
            data: updatedAlphabet
        });

    } catch (error) {
        console.error("Update alphabet error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete alphabet (soft delete)
export const deleteAlphabet = async (req, res) => {
    try {
        const { letter } = req.params;
        const upperLetter = letter.toUpperCase();

        const alphabet = await Alphabet.findOneAndUpdate(
            { letter: upperLetter },
            { isActive: false },
            { new: true }
        );

        if (!alphabet) {
            return res.status(404).json({
                success: false,
                message: "Alphabet not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Alphabet deleted successfully",
            data: alphabet
        });

    } catch (error) {
        console.error("Delete alphabet error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
