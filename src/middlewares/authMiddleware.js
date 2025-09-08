import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const checkLogin = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by username from token
        const user = await User.findOne({ _id: decoded.username }).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token. User not found."
            });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            // No token provided, continue without authentication
            req.user = null;
            return next();
        }

        // Verify token if provided
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ username: decoded.username }).select('-password');

        if (user) {
            req.user = user;
        } else {
            req.user = null;
        }

        next();

    } catch (error) {
        // If token is invalid, continue without authentication
        req.user = null;
        next();
    }
};
