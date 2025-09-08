import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { generateToken } from '../lib/utils.js';

// Validation functions
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isPasswordValid = (password) => {
    // Check for at least 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return passwordRegex.test(password);
};

// Signup Controller
export const signup = async (req, res) => {
    try {
        const { username, displayName, email, password } = req.body;

        // Validation
        if (!username || !displayName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Email validation
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        // Password length validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Password strength validation
        if (!isPasswordValid(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email or username already exists"
            });
        }

        // Hash password
        const saltRounds = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            username,
            displayName,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Generate token and set cookie
        const token = generateToken(newUser._id, res);

        res.status(201).json({
            success: true,
            message: "User created successfully"
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Login Controller
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        // Find user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        // Check if user has a password (for Google OAuth users)
        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: "Please use Google login for this account"
            });
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        // Generate token and set cookie
        const token = generateToken(user._id, res);

        res.status(200).json({
            success: true,
            message: "Login successful",
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Logout Controller
export const logout = async (req, res) => {
    try {
        // Clear the JWT cookie
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/'
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// // Update Profile Picture
// export const updatepfp = async (req, res) => {
//     try {
//         const { pfp } = req.body;
//         const username = req.user.username;

//         if (!pfp) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Profile picture URL is required"
//             });
//         }

//         const updatedUser = await User.findOneAndUpdate(
//             { username },
//             { pfp },
//             { new: true }
//         );

//         if (!updatedUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Profile picture updated successfully",
//             user: {
//                 id: updatedUser._id,
//                 username: updatedUser.username,
//                 displayName: updatedUser.displayName,
//                 email: updatedUser.email,
//                 pfp: updatedUser.pfp
//             }
//         });

//     } catch (error) {
//         console.error("Update profile picture error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error"
//         });
//     }
// };

// // Update Username
// export const updateusername = async (req, res) => {
//     try {
//         const { newUsername } = req.body;
//         const currentUsername = req.user.username;

//         if (!newUsername) {
//             return res.status(400).json({
//                 success: false,
//                 message: "New username is required"
//             });
//         }

//         // Check if new username already exists
//         const existingUser = await User.findOne({ username: newUsername });
//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Username already taken"
//             });
//         }

//         const updatedUser = await User.findOneAndUpdate(
//             { username: currentUsername },
//             { username: newUsername },
//             { new: true }
//         );

//         if (!updatedUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         // Generate new token with updated username
//         const token = generateToken(newUsername, res);

//         res.status(200).json({
//             success: true,
//             message: "Username updated successfully",
//             user: {
//                 id: updatedUser._id,
//                 username: updatedUser.username,
//                 displayName: updatedUser.displayName,
//                 email: updatedUser.email,
//                 pfp: updatedUser.pfp
//             },
//             token
//         });

//     } catch (error) {
//         console.error("Update username error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error"
//         });
//     }
// };

// // Google Auth Callback
// export const googleAuthCallback = async (req, res) => {
//     try {
//         const user = req.user;
        
//         // Generate token for Google authenticated user
//         const token = generateToken(user.username, res);

//         // Redirect to frontend with success
//         res.redirect(`${process.env.CLIENT_URL}/auth/success`);

//     } catch (error) {
//         console.error("Google auth callback error:", error);
//         res.redirect(`${process.env.CLIENT_URL}/auth/failure`);
//     }
// };

// // Google Auth Failure
// export const googleAuthFailure = (req, res) => {
//     res.status(401).json({
//         success: false,
//         message: "Google authentication failed"
//     });
// };

// // Get User Info
// export const getUSerinfo = async (req, res) => {
//     try {
//         const username = req.user.username;
        
//         const user = await User.findOne({ username }).select('-password');
        
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             user: {
//                 id: user._id,
//                 username: user.username,
//                 displayName: user.displayName,
//                 email: user.email,
//                 pfp: user.pfp,
//                 googleId: user.googleId
//             }
//         });

//     } catch (error) {
//         console.error("Get user info error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error"
//         });
//     }
// };
