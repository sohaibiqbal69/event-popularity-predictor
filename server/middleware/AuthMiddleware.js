const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication required",
                success: false
            });
        }
        
        // Check if the token is in Bearer format
        const parts = authHeader.split(' ');
        
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                message: "Invalid token format",
                success: false
            });
        }
        
        const token = parts[1];
        
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find the user in the database
        const user = await UserModel.findById(decoded._id);
        
        if (!user) {
            return res.status(401).json({
                message: "User not found",
                success: false
            });
        }
        
        // Attach the user to the request object
        req.user = user;
        
        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: "Invalid token",
                success: false
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Token expired",
                success: false
            });
        }
        
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

module.exports = authMiddleware; 