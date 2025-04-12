const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require("../models/User");
require('dotenv').config();

const signup = async (req, res) => {
    try {
        const {name, email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409)
                .json({message: 'User already exists, you can login',success: false});
        }
        const userModel = new UserModel({name, email, password });
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();
        res.status(201)
            .json({message: "signup successful",
                success: true
            })
    } catch (err) {
        res.status(500)
            .json({
                message: "Internal server error",
                success: false
            })
    }
}

const login = async (req, res) => {
    try {
        console.log('Login attempt for email:', req.body.email);
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        const errorMsg = 'Authentication failed, email or password is incorrect';
        if (!user) {
            console.log('User not found:', email);
            return res.status(403)
                .json({message: errorMsg, success: false});
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if(!isPassEqual){
            console.log('Password mismatch for user:', email);
            return res.status(403)
                .json({message: errorMsg, success: false});
        }

        console.log('Login successful, generating token...');
        console.log('JWT_SECRET is', process.env.JWT_SECRET ? 'defined' : 'undefined');
        console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ message: "Server configuration error" });
        }

        const tokenPayload = {email: user.email, _id: user._id};
        console.log('Token payload:', tokenPayload);
        
        const jwtToken = jwt.sign(
            tokenPayload, 
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        );

        console.log('Token generated successfully, length:', jwtToken.length);
        console.log('Token preview:', jwtToken.substring(0, 10) + '...');

        res.status(200)
            .json({
                message: "login successful",
                success: true,
                jwtToken,
                email,
                name: user.name
            });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500)
            .json({
                message: "Internal server error",
                success: false
            })
    }
}

module.exports = {
    signup,
    login
}