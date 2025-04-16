const bcrypt = require('bcrypt');
const UserModel = require("../models/User");
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get user profile
const getProfile = async (req, res) => {
    try {
        
        const userId = req.user._id;
        
        
        const user = await UserModel.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, email, currentPassword, newPassword } = req.body;
        
        // Find the user
        const user = await UserModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        // Update basic info
        if (name) user.name = name;
        if (email) user.email = email;
        
        
        if (currentPassword && newPassword) {
            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            
            if (!isPasswordValid) {
                return res.status(400).json({
                    message: "Current password is incorrect",
                    success: false
                });
            }
            
            // Hash and update new password
            user.password = await bcrypt.hash(newPassword, 10);
        }
        
        // Handle profile image if provided
        if (req.file) {
            // add it to the User model
            user.profileImage = req.file.path;
        }
        
        // Save the updated user
        await user.save();
        
        // Return updated user without password
        const updatedUser = await UserModel.findById(userId).select('-password');
        
        res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user: updatedUser
        });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

module.exports = {
    getProfile,
    updateProfile
}; 